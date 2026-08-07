import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Cpu, Globe, Target, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface Competitor {
  _id: string;
  name: string;
  website: string;
  notes: string;
  lastReport: any;
  lastReportAt: string;
}

const CompetitorTracker: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComp, setNewComp] = useState({ name: '', website: '', notes: '' });
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [threatFilter, setThreatFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCompetitors = async () => {
    try {
      setLoading(true);
      const res = await apiService.listCompetitors();
      setCompetitors(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const filteredCompetitors = competitors.filter(comp => {
    const matchesThreat = threatFilter === 'ALL' || (comp.lastReport?.threatLevel?.toUpperCase() === threatFilter);
    const matchesSearch = !searchTerm || comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || comp.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesThreat && matchesSearch;
  });

  const highThreatCount = competitors.filter(c => c.lastReport?.threatLevel?.toUpperCase() === 'HIGH').length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComp.name) return;
    try {
      await apiService.addCompetitor(newComp);
      setNewComp({ name: '', website: '', notes: '' });
      setShowAddModal(false);
      fetchCompetitors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete competitor?')) return;
    try {
      await apiService.deleteCompetitor(id);
      fetchCompetitors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async (id: string) => {
    setGeneratingFor(id);
    try {
      await apiService.generateCompetitorReport(id);
      fetchCompetitors();
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingFor(null);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-sand-400 bg-sand-500/10 border-sand-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a122a] font-sans pb-12">
      <main className="container mx-auto px-4 max-w-5xl mt-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sage-300 to-sand-300 bg-clip-text text-transparent mb-2">
              Competitor Intelligence Tracker
            </h1>
            <p className="text-sand-400 text-lg">Monitor rivals, analyze weaknesses, and refine your market moat.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-sage-600 hover:bg-sage-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-sage-500/20"
          >
            <Plus className="h-5 w-5" /> Add Competitor
          </button>
        </div>

        {/* Intelligence Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111b36] border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Tracked Rivals</p>
              <p className="text-2xl font-bold text-sand-100 mt-1">{competitors.length}</p>
            </div>
            <Target className="h-8 w-8 text-sage-400 opacity-80" />
          </div>

          <div className="bg-[#111b36] border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">High Threat Alerts</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{highThreatCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-rose-400 opacity-80" />
          </div>

          <div className="bg-[#111b36] border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">Moat Coverage</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{competitors.length > 0 ? 'Active' : 'N/A'}</p>
            </div>
            <Shield className="h-8 w-8 text-emerald-400 opacity-80" />
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#111b36] p-4 rounded-2xl border border-stone-800">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(level => (
              <button
                key={level}
                onClick={() => setThreatFilter(level)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  threatFilter === level
                    ? 'bg-sage-500 text-ink-900 shadow-md shadow-sage-500/20'
                    : 'bg-stone-800/80 text-sand-400 hover:text-sand-200'
                }`}
              >
                {level === 'ALL' ? 'All Threats' : `${level} Threat`}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search competitors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-[#0a122a] border border-stone-700 text-sand-100 placeholder-stone-500 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-sage-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-sand-400">Loading competitors...</div>
        ) : competitors.length === 0 ? (
          <div className="bg-[#111b36] border border-stone-800 rounded-3xl p-16 text-center shadow-xl">
            <Target className="h-16 w-16 text-stone-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-sand-200 mb-2">No competitors tracked yet</h3>
            <p className="text-stone-400 mb-8 max-w-md mx-auto">Keep a close eye on your market. Add a competitor to generate deep competitive intelligence.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-sand-200 font-medium rounded-xl transition-all"
            >
              Start Tracking
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCompetitors.map(comp => {
              const rep = comp.lastReport;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={comp._id} 
                  className="bg-[#111b36] border border-stone-800 rounded-3xl overflow-hidden shadow-xl"
                >
                  {/* Header */}
                  <div className="p-6 md:p-8 border-b border-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-b from-stone-900/50 to-transparent">
                    <div>
                      <h2 className="text-2xl font-bold text-sand-100 flex items-center gap-3">
                        {comp.name}
                        {rep?.threatLevel && (
                          <span className={`text-xs px-3 py-1 rounded-full border ${getThreatColor(rep.threatLevel)}`}>
                            {rep.threatLevel} Threat
                          </span>
                        )}
                      </h2>
                      {comp.website && (
                         <a href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-2 text-sage-400 hover:text-sage-300 transition-colors text-sm">
                           <Globe className="h-4 w-4" /> {comp.website}
                         </a>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleGenerateReport(comp._id)}
                        disabled={generatingFor === comp._id}
                        className="flex items-center gap-2 px-4 py-2 bg-sage-500/10 hover:bg-sage-500/20 text-sage-300 border border-sage-500/30 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                      >
                        {generatingFor === comp._id ? (
                          <><Cpu className="h-4 w-4 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Cpu className="h-4 w-4" /> Fresh Intel</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(comp._id)}
                        className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 md:p-8">
                    {!rep ? (
                      <div className="text-center py-10">
                        <AlertTriangle className="h-10 w-10 text-stone-600 mx-auto mb-3" />
                        <p className="text-stone-400">No report generated yet. Run intel analysis to see details.</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" /> Position Summary
                          </h4>
                          <p className="text-sand-200 leading-relaxed text-sm">{rep.summary}</p>
                          
                          <h4 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mt-8 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-sage-400" /> Strategic Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {(rep.recommendations || []).map((rec: string, i: number) => (
                              <li key={i} className="text-sm text-sand-300 flex gap-2">
                                <span className="text-sage-500">•</span> {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-[#0a122a] p-5 rounded-2xl border border-stone-800">
                          <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Observed Strengths
                          </h4>
                          <ul className="mb-6 space-y-1.5">
                            {(rep.strengths || []).map((s: string, i: number) => (
                              <li key={i} className="text-sm text-sand-300 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">{s}</li>
                            ))}
                          </ul>
                          
                          <h4 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> Exploitable Weaknesses
                          </h4>
                          <ul className="mb-6 space-y-1.5">
                            {(rep.weaknesses || []).map((w: string, i: number) => (
                              <li key={i} className="text-sm text-sand-300 px-3 py-1.5 bg-rose-500/5 border border-rose-500/10 rounded-lg">{w}</li>
                            ))}
                          </ul>

                          {rep.recentMoves && rep.recentMoves.length > 0 && (
                            <>
                              <h4 className="text-sm font-bold text-blue-400 mb-2">Recent Moves</h4>
                              <ul className="space-y-1">
                                {rep.recentMoves.map((m: string, i: number) => (
                                  <li key={i} className="text-xs text-sand-400 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 block" /> {m}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {comp.lastReportAt && (
                    <div className="px-6 py-3 bg-stone-900/50 border-t border-stone-800 text-xs text-stone-500 text-right">
                       Last updated: {new Date(comp.lastReportAt).toLocaleString()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a122a]/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111b36] border border-stone-700 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-sand-100 mb-6">Track New Competitor</h2>
              <form onSubmit={handleAdd} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Company Name *</label>
                  <input
                    type="text" required
                    value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})}
                    className="w-full bg-[#0a122a] border border-stone-700 text-sand-100 rounded-xl px-4 py-3 focus:outline-none focus:border-sage-500 transition-colors"
                    placeholder="e.g. Stripe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={newComp.website} onChange={e => setNewComp({...newComp, website: e.target.value})}
                    className="w-full bg-[#0a122a] border border-stone-700 text-sand-100 rounded-xl px-4 py-3 focus:outline-none focus:border-sage-500 transition-colors"
                    placeholder="e.g. stripe.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Personal Notes</label>
                  <textarea
                    value={newComp.notes} onChange={e => setNewComp({...newComp, notes: e.target.value})}
                    className="w-full bg-[#0a122a] border border-stone-700 text-sand-100 rounded-xl px-4 py-3 focus:outline-none focus:border-sage-500 transition-colors h-24 resize-none"
                    placeholder="Why are you tracking them?"
                  />
                </div>
                <div className="flex gap-4 pt-4 border-t border-stone-800">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-stone-400 hover:text-sand-200 font-medium transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-sage-600 hover:bg-sage-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-sage-500/20">Add tracker</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompetitorTracker;
