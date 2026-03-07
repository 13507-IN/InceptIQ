import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, CircleCheck, AlertCircle, TrendingUp, ShieldCheck, Swords, Lightbulb, BarChart3 } from 'lucide-react';
import { StartupIdea } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase =
    | 'connecting'
    | 'thinking'
    | 'streaming'
    | 'parsing'
    | 'done'
    | 'error';

interface StreamState {
    phase: Phase;
    analysisId: string | null;
    overallScore: number | null;
    rawChunks: string;     // accumulated raw text from Gemini
    charCount: number;
    errorMessage: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ANALYSIS_PHASES = [
    { icon: BrainCircuit, label: 'Understanding your idea', color: 'text-blue-400' },
    { icon: TrendingUp, label: 'Evaluating market viability', color: 'text-emerald-400' },
    { icon: Swords, label: 'Mapping competitive landscape', color: 'text-amber-400' },
    { icon: ShieldCheck, label: 'Identifying risks & mitigations', color: 'text-rose-400' },
    { icon: Lightbulb, label: 'Generating opportunities', color: 'text-purple-400' },
    { icon: BarChart3, label: 'Computing your overall score', color: 'text-cyan-400' },
];

// Extract score numbers from the streaming raw text while it's being built
function extractScoreFromPartial(text: string): number | null {
    const match = text.match(/"overallScore"\s*:\s*(\d+)/);
    if (match) return Math.min(100, Math.max(0, parseInt(match[1], 10)));
    return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

const AnalysisStreaming: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const ideaData: StartupIdea = location.state?.ideaData;

    const [state, setState] = useState<StreamState>({
        phase: 'connecting',
        analysisId: null,
        overallScore: null,
        rawChunks: '',
        charCount: 0,
        errorMessage: null,
    });

    // Rotating loading phase label index
    const [phaseIndex, setPhaseIndex] = useState(0);
    const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const hasDoneRef = useRef(false); // prevent double-navigation

    // Rotate through visual loading phases every ~4 seconds while streaming
    useEffect(() => {
        if (state.phase === 'streaming' || state.phase === 'thinking') {
            phaseTimerRef.current = setInterval(() => {
                setPhaseIndex((prev) => (prev + 1) % ANALYSIS_PHASES.length);
            }, 4000);
        }
        return () => {
            if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
        };
    }, [state.phase]);

    // ─── SSE fetch ───────────────────────────────────────────────────────────

    const startStream = useCallback(async () => {
        if (!ideaData) {
            setState((s) => ({ ...s, phase: 'error', errorMessage: 'No idea data found. Please go back and fill in the form.' }));
            return;
        }

        const token = localStorage.getItem('iv_token');
        const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const ENV = process.env.NODE_ENV || 'development';

        abortRef.current = new AbortController();

        try {
            // Try streaming endpoint first
            let response = await fetch(`${API_BASE}/analyze/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(ideaData),
                signal: abortRef.current.signal,
            });

            // If streaming endpoint returns 404 in local dev, log helpful message
            if (!response.ok && response.status === 404 && ENV !== 'production') {
                console.warn(
                    `⚠️  Streaming endpoint not found at ${API_BASE}/analyze/stream\n` +
                    'Please ensure your local server is running on port 5000 with the latest code.\n' +
                    'Command: npm start (from server directory)'
                );
            }

            if (!response.ok) {
                const errText = await response.text();
                let message = `Server error ${response.status}`;
                try { message = JSON.parse(errText)?.message || message; } catch { /* noop */ }
                
                // Add helpful debugging info for non-production
                if (ENV !== 'production') {
                    message += `\n\n📍 API Base: ${API_BASE}\n🔑 Token present: ${!!token}`;
                }
                
                setState((s) => ({ ...s, phase: 'error', errorMessage: message }));
                return;
            }

            // Read the body as a stream of SSE text
            const reader = response.body?.getReader();
            if (!reader) {
                setState((s) => ({ ...s, phase: 'error', errorMessage: 'Browser does not support streaming.' }));
                return;
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // SSE messages are separated by double newlines
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? ''; // keep incomplete last chunk

                for (const part of parts) {
                    if (!part.trim()) continue;

                    let eventType = 'message';
                    let dataStr = '';

                    for (const line of part.split('\n')) {
                        if (line.startsWith('event:')) eventType = line.slice(6).trim();
                        if (line.startsWith('data:')) dataStr = line.slice(5).trim();
                    }

                    let payload: any = {};
                    try { payload = JSON.parse(dataStr); } catch { /* noop */ }

                    if (eventType === 'thinking') {
                        setState((s) => ({ ...s, phase: 'thinking' }));
                    } else if (eventType === 'chunk') {
                        setState((s) => {
                            const combined = s.rawChunks + (payload.text ?? '');
                            const partialScore = extractScoreFromPartial(combined);
                            return {
                                ...s,
                                phase: 'streaming',
                                rawChunks: combined,
                                charCount: payload.chars ?? s.charCount,
                                overallScore: partialScore ?? s.overallScore,
                            };
                        });
                    } else if (eventType === 'done') {
                        if (!hasDoneRef.current) {
                            hasDoneRef.current = true;
                            setState((s) => ({
                                ...s,
                                phase: 'done',
                                analysisId: payload.analysisId,
                                overallScore: payload.overallScore ?? s.overallScore,
                            }));
                            // Navigate after a brief "done" animation
                            setTimeout(() => {
                                navigate(`/results/${payload.analysisId}`);
                            }, 1400);
                        }
                    } else if (eventType === 'error') {
                        setState((s) => ({
                            ...s,
                            phase: 'error',
                            errorMessage: payload.message || 'Analysis failed. Please try again.',
                        }));
                    }
                }
            }
        } catch (err: any) {
            if (err?.name === 'AbortError') return; // user navigated away
            setState((s) => ({
                ...s,
                phase: 'error',
                errorMessage: err.message || 'Network error. Please check your connection.',
            }));
        }
    }, [ideaData, navigate, state]);

    useEffect(() => {
        startStream();
        return () => abortRef.current?.abort();
    }, [startStream]);

    // ─── Derived display values ───────────────────────────────────────────────

    const currentPhaseInfo = ANALYSIS_PHASES[phaseIndex % ANALYSIS_PHASES.length];
    const PhaseIcon = currentPhaseInfo.icon;

    const progressPct = state.phase === 'done' ? 100 :
        state.phase === 'parsing' ? 95 :
            state.phase === 'streaming' ? Math.min(90, 15 + (state.charCount / 30)) :
                state.phase === 'thinking' ? 10 :
                    state.phase === 'connecting' ? 3 : 0;

    const statusLabel =
        state.phase === 'connecting' ? 'Connecting to AI...' :
            state.phase === 'thinking' ? 'Gemini is thinking...' :
                state.phase === 'streaming' ? currentPhaseInfo.label :
                    state.phase === 'parsing' ? 'Finalising your report...' :
                        state.phase === 'done' ? 'Analysis complete! Redirecting...' :
                            'Something went wrong';

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#0a122a] flex items-center justify-center px-4">
            <AnimatePresence mode="wait">
                {/* ── Error state ─────────────────────────────────────────────── */}
                {state.phase === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-lg w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-10 text-center"
                    >
                        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
                        <p className="text-red-200 text-sm mb-6">{state.errorMessage}</p>
                        <button
                            onClick={() => navigate('/analysis')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
                        >
                            Try Again
                        </button>
                    </motion.div>

                ) : state.phase === 'done' ? (
                    /* ── Done state ─────────────────────────────────────────────── */
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                            className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-6"
                        >
                            <CircleCheck className="h-12 w-12 text-emerald-400" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete!</h2>
                        {state.overallScore !== null && (
                            <div className="mt-3 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                                {state.overallScore}
                                <span className="text-2xl text-emerald-400"> / 100</span>
                            </div>
                        )}
                        <p className="text-sand-400 mt-4 text-sm">Loading your full report…</p>
                    </motion.div>

                ) : (
                    /* ── Loading / Streaming state ──────────────────────────────── */
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-2xl"
                    >
                        {/* Title */}
                        <div className="text-center mb-10">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                className="inline-block mb-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage-500/30 to-blue-500/30 border border-sage-400/40 flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-sage-300" />
                                </div>
                            </motion.div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Analyzing{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-300 to-cyan-300">
                                    {ideaData?.ideaTitle || 'your idea'}
                                </span>
                            </h1>
                            <p className="text-sand-400">
                                Gemini AI is running a deep analysis — this typically takes 30–60 seconds.
                            </p>
                        </div>

                        {/* Main card */}
                        <div className="bg-[#111b36]/80 border border-sand-100/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">

                            {/* Progress bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs uppercase tracking-widest text-sand-400">Progress</span>
                                    <span className="text-xs text-sand-300 font-semibold">{Math.round(progressPct)}%</span>
                                </div>
                                <div className="h-2 w-full bg-[#0a1226] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sage-400 to-emerald-400"
                                        initial={{ width: '3%' }}
                                        animate={{ width: `${progressPct}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>

                            {/* Current Phase */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPhaseInfo.label}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16 }}
                                    transition={{ duration: 0.35 }}
                                    className="flex items-center gap-4 mb-6"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-100/5 border border-sand-100/10 flex-shrink-0">
                                        <PhaseIcon className={`h-5 w-5 ${currentPhaseInfo.color}`} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-sand-100">{statusLabel}</div>
                                        {state.charCount > 0 && (
                                            <div className="text-xs text-sand-500 mt-0.5">
                                                {state.charCount.toLocaleString()} characters generated…
                                            </div>
                                        )}
                                    </div>
                                    {/* Pulsing dot */}
                                    <div className="ml-auto flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.span
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-sage-400"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Phase timeline dots */}
                            <div className="flex items-center gap-1.5 mb-8">
                                {ANALYSIS_PHASES.map((p, i) => (
                                    <motion.div
                                        key={p.label}
                                        className={`flex-1 h-1 rounded-full ${i <= phaseIndex ? 'bg-sage-400' : 'bg-sand-100/10'
                                            }`}
                                        animate={{ opacity: i === phaseIndex ? [1, 0.6, 1] : 1 }}
                                        transition={{ duration: 1.4, repeat: i === phaseIndex ? Infinity : 0 }}
                                    />
                                ))}
                            </div>

                            {/* Live text preview */}
                            {state.rawChunks && (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111b36] via-transparent to-transparent z-10 rounded-xl pointer-events-none" />
                                    <div className="font-mono text-[10px] text-sage-400/60 leading-relaxed max-h-24 overflow-hidden rounded-xl bg-[#0a1226]/60 p-3 border border-sand-100/5">
                                        {state.rawChunks.slice(-600)}
                                        <motion.span
                                            className="inline-block w-1.5 h-3 bg-sage-400 ml-0.5 align-middle"
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.7, repeat: Infinity }}
                                        />
                                    </div>
                                    <div className="absolute bottom-2 right-2 z-20 text-[9px] uppercase tracking-widest text-sand-500">
                                        Live output
                                    </div>
                                </div>
                            )}

                            {/* Partial score reveal */}
                            {state.overallScore !== null && state.phase === 'streaming' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                                >
                                    <span className="text-xs text-emerald-400 uppercase tracking-wider">Prelim. Score</span>
                                    <span className="text-2xl font-black text-emerald-300 ml-auto">{state.overallScore}<span className="text-sm font-normal text-emerald-500">/100</span></span>
                                </motion.div>
                            )}
                        </div>

                        {/* Disclaimer */}
                        <p className="text-center text-xs text-sand-500 mt-4">
                            Don't close this tab — your analysis is being generated in real time.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnalysisStreaming;
