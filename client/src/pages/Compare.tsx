import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, X, Plus } from 'lucide-react';
import { apiService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ScoreBadge from '../components/ScoreBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const Compare: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();

    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userResearches, setUserResearches] = useState<any[]>([]);
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        const idsParam = searchParams.get('ids');
        if (idsParam) {
            const ids = idsParam.split(',').filter(Boolean);
            loadAnalyses(ids);
        } else {
            setLoading(false);
            setShowSelector(true);
        }
        loadUserResearches();
    }, [searchParams]);

    const loadUserResearches = async () => {
        try {
            const response = await apiService.getUserResearches();
            if (response && response.requests) {
                setUserResearches(response.requests);
            }
        } catch (err) {
            console.error('Failed to load user researches', err);
        }
    };

    const loadAnalyses = async (ids: string[]) => {
        try {
            setLoading(true);
            setError(null);
            const results = await Promise.all(
                ids.map(id => apiService.getAnalysis(id).catch(err => null))
            );

            const validResults = results
                .filter(res => res !== null)
                .map(res => {
                    const full = res?.data ?? res ?? null;
                    return {
                        id: res.id || full?.id || Math.random().toString(), // fallback id
                        analysisData: full?.analysis ?? full ?? null,
                        input: full?.input || null
                    };
                });

            if (validResults.length === 0 && ids.length > 0) {
                setError("Could not load any of the selected analyses.");
            } else {
                // Map back original IDs if possible
                validResults.forEach((vr, i) => {
                    vr.id = ids[i] || vr.id;
                });
                setAnalyses(validResults);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load analyses for comparison.');
        } finally {
            setLoading(false);
        }
    };

    const addAnalysisToCompare = (id: string) => {
        const currentIds = searchParams.get('ids') ? searchParams.get('ids')!.split(',') : [];
        if (!currentIds.includes(id)) {
            if (currentIds.length >= 4) {
                addToast({ variant: 'error', title: 'Limit Reached', message: 'You can compare up to 4 analyses at a time.' });
                return;
            }
            currentIds.push(id);
            setSearchParams({ ids: currentIds.join(',') });
            setShowSelector(false);
        }
    };

    const removeAnalysis = (idToRemove: string) => {
        const currentIds = searchParams.get('ids') ? searchParams.get('ids')!.split(',') : [];
        const newIds = currentIds.filter(id => id !== idToRemove);
        if (newIds.length === 0) {
            searchParams.delete('ids');
            setSearchParams(searchParams);
            setAnalyses([]);
            setShowSelector(true);
        } else {
            setSearchParams({ ids: newIds.join(',') });
        }
    };

    if (loading) return <LoadingSpinner fullScreen message="Loading comparison..." />;

    return (
        <motion.div
            className="max-w-7xl mx-auto px-6 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        Idea Comparison
                    </h1>
                    <p className="text-gray-400">Compare multiple analyses side-by-side</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {showSelector && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 max-w-2xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Select an analysis to compare</h2>
                    {userResearches.length === 0 ? (
                        <p className="text-gray-400">You don't have any analyses yet.</p>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {userResearches.map(research => {
                                const isSelected = analyses.some(a => a.id === research.id);
                                return (
                                    <button
                                        key={research.id}
                                        disabled={isSelected}
                                        onClick={() => addAnalysisToCompare(research.id)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${isSelected ? 'bg-blue-500/10 border-blue-500/30 opacity-50 cursor-not-allowed' : 'bg-gray-900 border-gray-700 hover:border-blue-500/50 hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="font-semibold text-white truncate">{research.input?.ideaTitle || 'Untitled'}</div>
                                        <div className="text-sm text-gray-400 mt-1 truncate">{research.input?.ideaDescription}</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <button
                        onClick={() => setShowSelector(false)}
                        className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {analyses.length > 0 && !showSelector && (
                <div className="overflow-x-auto pb-8">
                    <div className="flex gap-6 min-w-max">
                        {/* First Column: Labels */}
                        <div className="w-48 shrink-0 py-4 flex flex-col gap-6">
                            <div className="h-24 sticky top-0 bg-[#0a122a] z-10 hidden md:block"></div>

                            <div className="bg-gray-800/20 rounded-lg p-4 invisible md:visible">
                                <h3 className="text-lg font-semibold text-gray-300 mb-4 h-6">Scores</h3>
                                <div className="space-y-4">
                                    <div className="h-10 flex items-center text-sm font-medium text-gray-400 uppercase">Overall</div>
                                    <div className="h-6 flex items-center text-sm font-medium text-gray-400 uppercase">Uniqueness</div>
                                    <div className="h-6 flex items-center text-sm font-medium text-gray-400 uppercase">Market</div>
                                    <div className="h-6 flex items-center text-sm font-medium text-gray-400 uppercase">Competition</div>
                                </div>
                            </div>

                            <div className="bg-gray-800/20 rounded-lg p-4 invisible md:visible h-48">
                                <h3 className="text-lg font-semibold text-gray-300 h-6">Risks</h3>
                            </div>

                            <div className="bg-gray-800/20 rounded-lg p-4 invisible md:visible h-48">
                                <h3 className="text-lg font-semibold text-gray-300 h-6">Opportunities</h3>
                            </div>
                        </div>

                        {/* Analysis Columns */}
                        {analyses.map(analysis => {
                            const data = analysis.analysisData;
                            const input = analysis.input;

                            if (!data) return (
                                <div key={analysis.id} className="w-80 shrink-0 bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center">
                                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                                    <p className="text-gray-400">Data unreadable</p>
                                    <button onClick={() => removeAnalysis(analysis.id)} className="mt-4 text-red-400 hover:text-red-300">Remove</button>
                                </div>
                            );

                            return (
                                <div key={analysis.id} className="w-80 shrink-0 flex flex-col gap-6">
                                    {/* Header */}
                                    <div className="h-24 p-4 bg-gray-900 border border-gray-700 rounded-xl relative group">
                                        <button
                                            onClick={() => removeAnalysis(analysis.id)}
                                            className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove from comparison"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <Link to={`/results/${analysis.id}`} className="block hover:bg-gray-800 -m-4 p-4 rounded-xl transition-colors h-full">
                                            <h2 className="font-bold text-white truncate text-lg" title={input?.ideaTitle}>{input?.ideaTitle || 'Untitled Analysis'}</h2>
                                            <p className="text-sm text-gray-400 truncate mt-1" title={input?.ideaDescription}>{input?.ideaDescription}</p>
                                        </Link>
                                    </div>

                                    {/* Scores */}
                                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex flex-col space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-300 mb-1 md:hidden">Scores</h3>
                                        <div className="h-10 flex items-center">
                                            <span className="md:hidden text-sm font-medium text-gray-400 uppercase w-24">Overall:</span>
                                            <ScoreBadge score={data.overallScore} size="lg" label="Overall" />
                                        </div>
                                        <div className="h-6 flex items-center">
                                            <span className="md:hidden text-sm font-medium text-gray-400 uppercase w-24">Unique:</span>
                                            <ScoreBadge score={data.uniquenessScore} size="sm" label="Unique" />
                                        </div>
                                        <div className="h-6 flex items-center">
                                            <span className="md:hidden text-sm font-medium text-gray-400 uppercase w-24">Market:</span>
                                            <ScoreBadge score={data.marketViabilityScore} size="sm" label="Market" />
                                        </div>
                                        <div className="h-6 flex items-center">
                                            <span className="md:hidden text-sm font-medium text-gray-400 uppercase w-24">Comp:</span>
                                            <ScoreBadge score={data.competitionScore} size="sm" label="Competition" />
                                        </div>
                                    </div>

                                    {/* Risks */}
                                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar">
                                        <h3 className="text-lg font-semibold text-gray-300 mb-3 md:hidden">Risks</h3>
                                        <ul className="space-y-3">
                                            {data.risks?.slice(0, 3).map((risk: any, idx: number) => (
                                                <li key={idx} className="text-sm text-amber-200/80 bg-amber-500/5 rounded p-2">
                                                    <span className="font-semibold text-amber-400 block mb-1">{risk.category || 'Risk'}</span>
                                                    {risk.description}
                                                </li>
                                            ))}
                                            {(!data.risks || data.risks.length === 0) && (
                                                <li className="text-sm text-gray-500">No risks identified.</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Opportunities */}
                                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar">
                                        <h3 className="text-lg font-semibold text-gray-300 mb-3 md:hidden">Opportunities</h3>
                                        <ul className="space-y-3">
                                            {data.opportunities?.slice(0, 3).map((opp: any, idx: number) => (
                                                <li key={idx} className="text-sm text-blue-200/80 bg-blue-500/5 rounded p-2">
                                                    <span className="font-semibold text-blue-400 block mb-1">{opp.area || 'Opportunity'}</span>
                                                    {opp.description}
                                                </li>
                                            ))}
                                            {(!data.opportunities || data.opportunities.length === 0) && (
                                                <li className="text-sm text-gray-500">No opportunities identified.</li>
                                            )}
                                        </ul>
                                    </div>

                                </div>
                            );
                        })}

                        {/* Add More Button */}
                        {analyses.length < 4 && (
                            <div className="w-80 shrink-0">
                                <button
                                    onClick={() => setShowSelector(true)}
                                    className="w-full h-24 mt-0 border-2 border-dashed border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/30 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400 transition-all font-semibold"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add Analysis
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Compare;
