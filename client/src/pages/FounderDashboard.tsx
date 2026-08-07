import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { LineChart, Plus, TrendingUp, Calendar, Zap, FileText, Target, CheckSquare, Square, Rocket, ChevronDown, Sparkles, Copy, Check, Send } from 'lucide-react';

interface Analysis {
  id: string;
  input?: {
    ideaTitle?: string;
    ideaDescription?: string;
    industry?: string;
  };
  idea?: string;
  createdAt: string;
  score?: number;
  status?: string;
  analysis?: any;
}

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  totalViews: number;
}

interface FollowUpReport {
  stage: string;
  stageTitle: string;
  milestoneSummary: string;
  priorities: string[];
  betaAcquisitionTactics: string[];
  launchChecklist: Array<{ task: string; category: string; timeframe: string }>;
  investorUpdateDraft: string;
}

const STAGES = [
  { id: 'validation', label: '1. Validation', subtitle: 'Day 0', icon: Target, desc: 'Hypothesis testing & market score audit' },
  { id: 'mvp', label: '2. MVP Building', subtitle: 'Month 1', icon: Zap, desc: 'Core feature scope & prototype testing' },
  { id: 'prelaunch', label: '3. Pre-Launch Beta', subtitle: 'Month 2-3', icon: Sparkles, desc: 'Waitlist growth & early adopter feedback' },
  { id: 'launch', label: '4. Market Launch', subtitle: 'Month 3+', icon: Rocket, desc: 'GTM channels & investor updates' }
];

const FounderDashboard: React.FC = () => {
  const { token, user } = useContext<AuthContextValue>(AuthContext);
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([]);
  const [activeIdeaId, setActiveIdeaId] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({ totalAnalyses: 0, averageScore: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Venture Stage Tracker State
  const [currentStage, setCurrentStage] = useState<string>('mvp');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [progressNotes, setProgressNotes] = useState('');
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);
  const [followUpReport, setFollowUpReport] = useState<FollowUpReport | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Dynamic 7-day checklist progress state
  const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getUserResearches();
        
        if (response && response.requests && Array.isArray(response.requests)) {
          const list = response.requests as Analysis[];
          setAllAnalyses(list);

          // Restore or select active idea
          const savedActiveId = localStorage.getItem('inceptiq_active_idea_id');
          if (savedActiveId && list.some(item => item.id === savedActiveId)) {
            setActiveIdeaId(savedActiveId);
          } else if (list.length > 0) {
            setActiveIdeaId(list[0].id);
          }

          const validAnalyses = list.filter((r: any) => {
            const a = r.analysis;
            return a && (a.overallScore != null || a.analysis?.overallScore != null);
          });

          const totalAnalyses = list.length;
          const averageScore = validAnalyses.length > 0
            ? Math.round(validAnalyses.reduce((sum: number, a: any) => {
                const score = a.analysis?.analysis?.overallScore ?? a.analysis?.overallScore ?? 0;
                return sum + score;
              }, 0) / validAnalyses.length)
            : 0;
          const totalViews = list.length * 3;

          setStats({ totalAnalyses, averageScore, totalViews });
        } else {
          setAllAnalyses([]);
          setStats({ totalAnalyses: 0, averageScore: 0, totalViews: 0 });
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Load checked tasks for active idea
  useEffect(() => {
    if (!activeIdeaId) return;
    try {
      const savedChecks = localStorage.getItem(`inceptiq_checklist_${activeIdeaId}`);
      if (savedChecks) {
        setCheckedTasks(JSON.parse(savedChecks));
      } else {
        setCheckedTasks({});
      }
      localStorage.setItem('inceptiq_active_idea_id', activeIdeaId);
    } catch (e) {
      console.warn('Failed to load task checks:', e);
    }
  }, [activeIdeaId]);

  const activeAnalysis = allAnalyses.find(a => a.id === activeIdeaId) || allAnalyses[0];

  // Derive dynamic 7-day checklist items from active idea's AI recommendations
  const getDynamicChecklist = () => {
    if (!activeAnalysis) return [];
    
    const rootAnalysis = (activeAnalysis as any).analysis?.analysis ?? (activeAnalysis as any).analysis ?? {};
    const recommendations = (activeAnalysis as any).analysis?.recommendations 
      || rootAnalysis.recommendations 
      || [];

    if (Array.isArray(recommendations) && recommendations.length > 0) {
      return recommendations.map((rec: any, idx: number) => ({
        id: `task_${idx}`,
        day: `Day ${Math.min(idx + 1, 7)}`,
        title: typeof rec === 'string' ? rec : (rec.action || rec.category || 'Action Item'),
        category: rec.category || 'Strategy',
        priority: rec.priority || 'High',
        timeframe: rec.timeline || 'Immediate'
      }));
    }

    // Fallback dynamic tasks if recommendations are minimal
    const ideaTitle = activeAnalysis.input?.ideaTitle || 'Startup Idea';
    return [
      { id: 'task_0', day: 'Day 1', title: `Conduct 5 problem-discovery interviews for ${ideaTitle}`, category: 'User Discovery', priority: 'High', timeframe: 'Day 1-2' },
      { id: 'task_1', day: 'Day 2', title: 'Audit top 3 direct competitors in Competitor Tracker', category: 'Competitive Intelligence', priority: 'High', timeframe: 'Day 2' },
      { id: 'task_2', day: 'Day 3-4', title: 'Draft value proposition headline & early waitlist landing page', category: 'MVP Setup', priority: 'Medium', timeframe: 'Day 3-4' },
      { id: 'task_3', day: 'Day 5-6', title: 'Define key acquisition channel & test initial messaging', category: 'Go-To-Market', priority: 'High', timeframe: 'Day 5-6' },
      { id: 'task_4', day: 'Day 7', title: 'Review unit economics & export executive PDF report for pitch', category: 'Investor Prep', priority: 'Medium', timeframe: 'Day 7' }
    ];
  };

  const checklistItems = getDynamicChecklist();

  const toggleTask = (taskId: string) => {
    const updated = { ...checkedTasks, [taskId]: !checkedTasks[taskId] };
    setCheckedTasks(updated);
    if (activeIdeaId) {
      localStorage.setItem(`inceptiq_checklist_${activeIdeaId}`, JSON.stringify(updated));
    }
  };

  const completedCount = checklistItems.filter(item => checkedTasks[item.id]).length;
  const progressPercentage = checklistItems.length > 0 ? Math.round((completedCount / checklistItems.length) * 100) : 0;

  const handleRunFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIdeaId) return;
    try {
      setGeneratingFollowUp(true);
      const res = await apiService.runVentureFollowUp(activeIdeaId, currentStage, progressNotes);
      setFollowUpReport(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate follow-up playbook');
    } finally {
      setGeneratingFollowUp(false);
    }
  };

  const copyInvestorDraft = () => {
    if (!followUpReport?.investorUpdateDraft) return;
    navigator.clipboard.writeText(followUpReport.investorUpdateDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a122a] via-[#111b36] to-[#0a122a] px-4 py-8 text-sand-100 font-sans">
      <motion.div
        className="container mx-auto max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sage-300 to-sand-200 bg-clip-text text-transparent mb-2">
              Founder Execution & Launch Hub
            </h1>
            <p className="text-sand-400 text-base">Welcome back, {user?.email || 'Founder'}! Track active ventures, turn AI analysis into execution, and run stage follow-ups.</p>
          </div>
          <Link
            to="/founder/analysis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage-500 to-sage-400 hover:from-sage-400 hover:to-sage-300 text-ink-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-sage-500/20"
          >
            <Plus className="h-5 w-5" />
            Validate New Idea
          </Link>
        </motion.div>

        {/* Active Idea Selector Dropdown */}
        {allAnalyses.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8 bg-[#111b36] border border-sage-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sage-500/20 rounded-xl">
                <Rocket className="h-6 w-6 text-sage-400" />
              </div>
              <div>
                <p className="text-xs text-sage-400 uppercase tracking-wider font-semibold">Active Venture Focus</p>
                <h2 className="text-xl font-bold text-sand-100 mt-0.5">
                  {activeAnalysis?.input?.ideaTitle || activeAnalysis?.idea || 'Select Active Idea'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs text-sand-400 whitespace-nowrap">Working On Idea:</label>
              <div className="relative w-full md:w-72">
                <select
                  value={activeIdeaId}
                  onChange={e => setActiveIdeaId(e.target.value)}
                  className="w-full bg-[#0a122a] border border-stone-700 text-sand-100 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-sage-500 appearance-none font-medium"
                >
                  {allAnalyses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.input?.ideaTitle || a.idea || 'Untitled Idea'} ({formatDate(a.createdAt)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-sand-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick KPI Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#111b36] border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Validated Ideas</p>
              <p className="text-3xl font-bold text-sand-100 mt-1">{stats.totalAnalyses}</p>
            </div>
            <FileText className="h-8 w-8 text-sage-400 opacity-80" />
          </div>

          <div className="bg-[#111b36] border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Avg Readiness Score</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{stats.averageScore}/100</p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-400 opacity-80" />
          </div>

          <div className="bg-[#111b36] border border-stone-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Execution Progress</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{progressPercentage}%</p>
            </div>
            <CheckSquare className="h-8 w-8 text-emerald-400 opacity-80" />
          </div>
        </motion.div>

        {/* Dynamic Real AI 7-Day Checklist */}
        <motion.div variants={itemVariants} className="mb-10 bg-[#111b36] border border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-sage-400" />
                <h2 className="text-2xl font-bold text-sand-100">
                  Real AI 7-Day Action Plan
                </h2>
              </div>
              <p className="text-sm text-sand-400 mt-1">
                Derived directly from AI recommendations for <span className="text-sage-300 font-semibold">{activeAnalysis?.input?.ideaTitle || 'Active Idea'}</span>.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-stone-400">Completed Tasks</p>
                <p className="text-lg font-bold text-emerald-400">{completedCount} of {checklistItems.length}</p>
              </div>
              <div className="w-24 bg-stone-800 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {checklistItems.length === 0 ? (
            <p className="text-sand-400 text-center py-6">No specific action items found for this idea.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {checklistItems.map((item) => {
                const isChecked = !!checkedTasks[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTask(item.id)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-sand-300'
                        : 'bg-[#0a122a] border-stone-800 hover:border-sage-500/40 text-sand-100'
                    }`}
                  >
                    <button className="mt-0.5 text-sage-400 focus:outline-none">
                      {isChecked ? <CheckSquare className="h-5 w-5 text-emerald-400" /> : <Square className="h-5 w-5 text-stone-500" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 bg-sage-500/20 text-sage-300 rounded">
                          {item.day}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-stone-800 text-sand-400 rounded">
                          {item.category}
                        </span>
                        {item.priority && (
                          <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                            {item.priority} Priority
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-medium ${isChecked ? 'line-through text-stone-400' : 'text-sand-100'}`}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Venture Lifecycle Stage Tracker & 3-Month AI Follow-Up */}
        <motion.div variants={itemVariants} className="mb-12 bg-gradient-to-br from-[#111b36] to-[#0a122a] border border-sage-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-sage-400" />
                <h2 className="text-2xl font-bold text-sand-100">
                  Venture Lifecycle Stage Tracker & AI Follow-Up
                </h2>
              </div>
              <p className="text-sm text-sand-400 mt-1">
                Worked on your idea for weeks/months? Transition stages to generate fresh launch playbooks and investor updates.
              </p>
            </div>

            <button
              onClick={() => setShowFollowUpModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-sage-500 hover:bg-sage-400 text-ink-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-sage-500/20"
            >
              <Send className="h-4 w-4" /> Run AI Stage Check-In
            </button>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {STAGES.map((s) => {
              const Icon = s.icon;
              const isActive = currentStage === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setCurrentStage(s.id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-sage-500/20 border-sage-400 shadow-lg shadow-sage-500/10'
                      : 'bg-[#0a122a] border-stone-800 hover:border-stone-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`h-6 w-6 ${isActive ? 'text-sage-300' : 'text-stone-400'}`} />
                    <span className="text-xs font-semibold px-2 py-0.5 bg-stone-800 text-sand-300 rounded">
                      {s.subtitle}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-sand-100 mb-1">{s.label}</h4>
                  <p className="text-xs text-sand-400">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Render Follow-Up Report Result */}
          {followUpReport && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-[#0a122a] border border-sage-500/40 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold px-3 py-1 bg-sage-500/20 text-sage-300 rounded-full">
                    {followUpReport.stage?.toUpperCase()} MILESTONE REPORT
                  </span>
                  <h3 className="text-2xl font-bold text-sand-100 mt-2">{followUpReport.stageTitle}</h3>
                </div>
                <button onClick={() => setFollowUpReport(null)} className="text-xs text-stone-400 hover:text-sand-200">Close</button>
              </div>

              <p className="text-sand-200 text-sm leading-relaxed">{followUpReport.milestoneSummary}</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#111b36] p-5 rounded-xl border border-stone-800">
                  <h4 className="text-sm font-bold text-sage-300 mb-3 uppercase tracking-wider">Top Priorities</h4>
                  <ul className="space-y-2">
                    {(followUpReport.priorities || []).map((p, i) => (
                      <li key={i} className="text-xs text-sand-200 flex items-start gap-2">
                        <span className="text-sage-400 font-bold">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#111b36] p-5 rounded-xl border border-stone-800">
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">Beta & Customer Acquisition Tactics</h4>
                  <ul className="space-y-2">
                    {(followUpReport.betaAcquisitionTactics || []).map((t, i) => (
                      <li key={i} className="text-xs text-sand-200 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Investor Update Email Draft */}
              {followUpReport.investorUpdateDraft && (
                <div className="bg-[#111b36] p-5 rounded-xl border border-stone-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Investor Update Email Draft</h4>
                    <button
                      onClick={copyInvestorDraft}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors font-medium"
                    >
                      {copiedDraft ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy Draft</>}
                    </button>
                  </div>
                  <pre className="text-xs text-sand-300 font-mono whitespace-pre-wrap bg-[#0a122a] p-4 rounded-lg border border-stone-800">
                    {followUpReport.investorUpdateDraft}
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Recent Analyses List */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-sand-100">All Saved Analyses</h2>
            <span className="text-sm bg-sage-500/20 text-sage-300 px-3 py-1 rounded-full">
              {allAnalyses.length}
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin h-8 w-8 border-4 border-sage-500 border-t-transparent rounded-full"></div>
              </div>
              <p className="text-sand-400 mt-4">Loading your analyses...</p>
            </div>
          ) : allAnalyses.length === 0 ? (
            <div className="bg-gradient-to-br from-sand-100/5 to-sage-500/5 border border-sand-200/10 rounded-xl p-12 text-center">
              <Zap className="h-12 w-12 text-sand-300 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-sand-200 mb-2">No analyses yet</h3>
              <p className="text-sand-400 mb-6">Start your first analysis to see your ideas evaluated by our AI system.</p>
              <Link
                to="/founder/analysis"
                className="inline-flex items-center gap-2 px-6 py-2 bg-sage-500 hover:bg-sage-400 text-ink-900 font-semibold rounded-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                Create First Analysis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allAnalyses.map((analysis, index) => {
                const isCurrentActive = analysis.id === activeIdeaId;
                return (
                  <div
                    key={analysis.id || index}
                    className={`group border rounded-2xl p-5 transition-all flex items-start justify-between gap-4 ${
                      isCurrentActive
                        ? 'bg-sage-500/10 border-sage-500/50'
                        : 'bg-gradient-to-r from-ink-800/40 to-ink-900/40 border-sand-200/10 hover:border-sage-400/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sand-100 font-semibold group-hover:text-sage-300 transition-colors line-clamp-1 text-lg">
                          {analysis.input?.ideaTitle || analysis.idea || 'Untitled Analysis'}
                        </h3>
                        {isCurrentActive && (
                          <span className="text-xs bg-sage-500 text-ink-900 font-bold px-2 py-0.5 rounded-full">
                            Active Focus
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-sand-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(analysis.createdAt)}
                        </div>
                        {(() => {
                          const score = (analysis as any).analysis?.analysis?.overallScore ?? (analysis as any).analysis?.overallScore;
                          return score != null ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-sage-500/20 rounded text-sage-300 font-medium">
                              <LineChart className="h-3.5 w-3.5" />
                              Score: {Math.round(score)}/100
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCurrentActive && (
                        <button
                          onClick={() => setActiveIdeaId(analysis.id)}
                          className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-sand-200 rounded-lg text-xs font-medium"
                        >
                          Set Active
                        </button>
                      )}
                      <a
                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/download/${analysis.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-sand-200 border border-stone-700 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-sage-400" />
                        PDF
                      </a>
                      <Link
                        to={`/results/${analysis.id}`}
                        className="px-4 py-2 bg-sage-500/20 hover:bg-sage-500/40 text-sage-300 rounded-lg transition-colors whitespace-nowrap text-xs font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* AI Follow-Up Modal */}
        <AnimatePresence>
          {showFollowUpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a122a]/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111b36] border border-stone-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-sand-100 mb-2">Run AI Milestone Follow-Up</h2>
                <p className="text-xs text-sand-400 mb-6">
                  Select your current venture stage and enter progress notes to generate launch tactics and an investor update.
                </p>

                <form onSubmit={handleRunFollowUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Target Stage</label>
                    <select
                      value={currentStage}
                      onChange={e => setCurrentStage(e.target.value)}
                      className="w-full bg-[#0a122a] border border-stone-700 text-sand-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage-500"
                    >
                      <option value="mvp">MVP Building Stage (Month 1)</option>
                      <option value="prelaunch">Pre-Launch & Beta Stage (Month 2-3)</option>
                      <option value="launch">Market Launch Stage (Month 3+)</option>
                      <option value="growth">Growth & Scaling Stage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">What progress have you made?</label>
                    <textarea
                      value={progressNotes}
                      onChange={e => setProgressNotes(e.target.value)}
                      placeholder="e.g. Built frontend MVP, gathered 40 email waitlist signups, preparing launch on Product Hunt..."
                      className="w-full bg-[#0a122a] border border-stone-700 text-sand-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sage-500 h-28 resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-stone-800">
                    <button type="button" onClick={() => setShowFollowUpModal(false)} className="flex-1 py-3 text-stone-400 hover:text-sand-200 font-medium text-sm">Cancel</button>
                    <button
                      type="submit"
                      disabled={generatingFollowUp}
                      className="flex-1 py-3 bg-sage-500 hover:bg-sage-400 text-ink-900 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {generatingFollowUp ? <><Sparkles className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Playbook</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default FounderDashboard;
