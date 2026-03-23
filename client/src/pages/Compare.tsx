import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, X, Plus } from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ScoreBadge from '../components/ScoreBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const Compare: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
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
                    <table className="table-fixed border-separate border-spacing-x-4 border-spacing-y-3" style={{ width: 'max-content' }}>
                        {/* Row 1: Headers */}
                        <thead>
                            <tr className="align-top">
                                <th className="w-32 hidden md:table-cell"></th>
                                {analyses.map(analysis => {
                                    const input = analysis.input;
                                    return (
                                        <th key={analysis.id} className="text-left p-0" style={{ width: '280px', maxWidth: '280px' }}>
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
                                        </th>
                                    );
                                })}
                                {analyses.length < 4 && (
                                    <th className="text-left p-0 align-top" style={{ width: '280px', maxWidth: '280px' }}>
                                        <button
                                            onClick={() => setShowSelector(true)}
                                            className="w-full h-24 border-2 border-dashed border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/30 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400 transition-all font-semibold"
                                        >
                                            <Plus className="h-5 w-5" />
                                            Add Analysis
                                        </button>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Row: Overall Score */}
                            <tr className="align-middle">
                                <td className="hidden md:table-cell text-sm font-medium text-gray-400 uppercase pr-4 py-2">Overall</td>
                                {analyses.map(analysis => (
                                    <td key={analysis.id} className="py-2">
                                        {analysis.analysisData ? (
                                            <ScoreBadge score={analysis.analysisData.overallScore} size="lg" label="Overall" />
                                        ) : <span className="text-gray-500">—</span>}
                                    </td>
                                ))}
                                {analyses.length < 4 && <td></td>}
                            </tr>
                            {/* Row: Uniqueness */}
                            <tr className="align-middle">
                                <td className="hidden md:table-cell text-sm font-medium text-gray-400 uppercase pr-4 py-2">Uniqueness</td>
                                {analyses.map(analysis => (
                                    <td key={analysis.id} className="py-2">
                                        {analysis.analysisData ? (
                                            <ScoreBadge score={analysis.analysisData.uniquenessScore} size="sm" label="Uniqueness" />
                                        ) : <span className="text-gray-500">—</span>}
                                    </td>
                                ))}
                                {analyses.length < 4 && <td></td>}
                            </tr>
                            {/* Row: Market */}
                            <tr className="align-middle">
                                <td className="hidden md:table-cell text-sm font-medium text-gray-400 uppercase pr-4 py-2">Market</td>
                                {analyses.map(analysis => (
                                    <td key={analysis.id} className="py-2">
                                        {analysis.analysisData ? (
                                            <ScoreBadge score={analysis.analysisData.marketViabilityScore} size="sm" label="Market" />
                                        ) : <span className="text-gray-500">—</span>}
                                    </td>
                                ))}
                                {analyses.length < 4 && <td></td>}
                            </tr>
                            {/* Row: Competition */}
                            <tr className="align-middle">
                                <td className="hidden md:table-cell text-sm font-medium text-gray-400 uppercase pr-4 py-2">Competition</td>
                                {analyses.map(analysis => (
                                    <td key={analysis.id} className="py-2">
                                        {analysis.analysisData ? (
                                            <ScoreBadge score={analysis.analysisData.competitionScore} size="sm" label="Competition" />
                                        ) : <span className="text-gray-500">—</span>}
                                    </td>
                                ))}
                                {analyses.length < 4 && <td></td>}
                            </tr>
                            {/* Row: Risks */}
                            <tr className="align-top">
                                <td className="hidden md:table-cell text-lg font-semibold text-gray-300 pr-4 pt-4">Risks</td>
                                {analyses.map(analysis => {
                                    const data = analysis.analysisData;
                                    return (
                                        <td key={analysis.id} className="pt-2" style={{ width: '280px', maxWidth: '280px' }}>
                                            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar" style={{ width: '280px' }}>
                                                <ul className="space-y-3">
                                                    {data?.risks?.slice(0, 3).map((risk: any, idx: number) => (
                                                        <li key={idx} className="text-sm text-amber-200/80 bg-amber-500/5 rounded p-2">
                                                            <span className="font-semibold text-amber-400 block mb-1">{risk.category || 'Risk'}</span>
                                                            <span className="line-clamp-3">{risk.description}</span>
                                                        </li>
                                                    ))}
                                                    {(!data?.risks || data.risks.length === 0) && (
                                                        <li className="text-sm text-gray-500">No risks identified.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </td>
                                    );
                                })}
                                {analyses.length < 4 && <td></td>}
                            </tr>
                            {/* Row: Opportunities */}
                            <tr className="align-top">
                                <td className="hidden md:table-cell text-lg font-semibold text-gray-300 pr-4 pt-4">Opportunities</td>
                                {analyses.map(analysis => {
                                    const data = analysis.analysisData;
                                    return (
                                        <td key={analysis.id} className="pt-2" style={{ width: '280px', maxWidth: '280px' }}>
                                            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar" style={{ width: '280px' }}>
                                                <ul className="space-y-3">
                                                    {data?.opportunities?.slice(0, 3).map((opp: any, idx: number) => (
                                                        <li key={idx} className="text-sm text-blue-200/80 bg-blue-500/5 rounded p-2">
                                                            <span className="font-semibold text-blue-400 block mb-1">{opp.area || 'Opportunity'}</span>
                                                            <span className="line-clamp-3">{opp.description}</span>
                                                        </li>
                                                    ))}
                                                    {(!data?.opportunities || data.opportunities.length === 0) && (
                                                        <li className="text-sm text-gray-500">No opportunities identified.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </td>
                                    );
                                })}
                                {analyses.length < 4 && <td></td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default Compare;
