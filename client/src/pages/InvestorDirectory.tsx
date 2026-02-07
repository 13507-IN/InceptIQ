import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  MapPin,
  Coins,
  Layers,
  Briefcase,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';
import { Investor, InvestorMatch } from '../types';

const stageOptions = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'];
const industryOptions = [
  'AI/ML',
  'SaaS',
  'Fintech',
  'Healthcare',
  'Climate',
  'Developer Tools',
  'Cybersecurity',
  'Marketplace',
  'Consumer',
  'EdTech',
  'Logistics',
  'Deep Tech'
];
const geographyOptions = ['North America', 'Europe', 'APAC', 'LATAM', 'MENA', 'Global'];
const modelOptions = ['B2B', 'B2C', 'Marketplace', 'Enterprise', 'Developer', 'Deep Tech', 'Hardware'];
const ticketOptions = [
  { label: 'Any', value: '' },
  { label: '$50k', value: '50000' },
  { label: '$100k', value: '100000' },
  { label: '$250k', value: '250000' },
  { label: '$500k', value: '500000' },
  { label: '$1M', value: '1000000' },
  { label: '$2M', value: '2000000' },
  { label: '$5M', value: '5000000' },
  { label: '$10M', value: '10000000' }
];

const formatCurrencyShort = (value?: number) => {
  if (!value && value !== 0) return '';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${Math.round(value)}`;
};

const fallbackCheckRange = (min?: number, max?: number) => {
  if (!min && !max) return 'Flexible';
  if (!min) return `Up to $${formatCurrencyShort(max)}`;
  if (!max) return `From $${formatCurrencyShort(min)}`;
  return `$${formatCurrencyShort(min)}-$${formatCurrencyShort(max)}`;
};

const scoreTone = (score: number) => {
  if (score >= 80) return 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200';
  if (score >= 60) return 'border-sky-400/40 bg-sky-500/20 text-sky-200';
  if (score >= 40) return 'border-amber-400/40 bg-amber-500/20 text-amber-200';
  return 'border-rose-400/40 bg-rose-500/20 text-rose-200';
};

const uniqueList = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const buildFocusTags = (investor: Investor) =>
  uniqueList([...(investor.industries || []), ...(investor.preferredModels || [])]);

const InvestorDirectory: React.FC = () => {
  const pageStyle = {
    backgroundColor: '#05070c',
    '--accent': '#38bdf8',
    '--accent-soft': '#7dd3fc',
    '--glow': '#22d3ee',
    '--ember': '#fbbf24'
  } as React.CSSProperties;
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [matchResults, setMatchResults] = useState<InvestorMatch[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [criteria, setCriteria] = useState({
    industry: '',
    stage: '',
    geography: '',
    model: '',
    ticketSize: '',
    keywords: ''
  });

  useEffect(() => {
    const loadInvestors = async () => {
      try {
        const data = await apiService.listInvestors();
        setInvestors(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load investor directory.');
      } finally {
        setLoading(false);
      }
    };

    loadInvestors();
  }, []);

  const handleCriteriaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleMatch = async (event: React.FormEvent) => {
    event.preventDefault();
    setMatching(true);
    setError(null);

    try {
      const payload = {
        industry: criteria.industry || undefined,
        stage: criteria.stage || undefined,
        geography: criteria.geography || undefined,
        model: criteria.model || undefined,
        ticketSize: criteria.ticketSize ? Number(criteria.ticketSize) : undefined,
        keywords: criteria.keywords || undefined
      };

      const data = await apiService.matchInvestors(payload);
      setMatchResults(data);
    } catch (err: any) {
      setError(err.message || 'Unable to match investors.');
    } finally {
      setMatching(false);
    }
  };

  const handleReset = () => {
    setCriteria({
      industry: '',
      stage: '',
      geography: '',
      model: '',
      ticketSize: '',
      keywords: ''
    });
    setMatchResults(null);
  };

  const listToDisplay: Array<Investor | InvestorMatch> = matchResults ?? investors;

  const hasMatchScore = (inv: Investor | InvestorMatch): inv is InvestorMatch =>
    'matchScore' in inv;

  const filteredInvestors = useMemo(() => {
    if (!searchTerm) return listToDisplay;
    const query = searchTerm.toLowerCase();
    return listToDisplay.filter((investor) => {
      const haystack = [
        investor.name,
        investor.type,
        investor.thesis,
        ...(investor.industries || []),
        ...(investor.geography || []),
        ...(investor.stages || [])
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [listToDisplay, searchTerm]);

  return (
    <div className="min-h-screen text-white" style={pageStyle}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),transparent_55%)]" />
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.35),transparent_60%)]" />
        <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.25),transparent_65%)]" />
        <div className="container mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.2em] text-[color:var(--accent-soft)]">
              <Sparkles className="h-4 w-4" />
              Investor Directory
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-semibold">
              Find investors that match your startup story.
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              Use the smart matcher to surface investors by stage, sector, region, and check size. This
              demo directory ships with a sample dataset so you can wire in real sources next.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Button className="bg-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] text-black font-semibold px-6 py-3 rounded-full" asChild>
                <Link to="/analysis" className="flex items-center gap-2">
                  Run an analysis first
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-full" asChild>
                <Link to="/support">Connect a data source</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card className="bg-white/5 border border-white/10 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-sky-300" />
                <h2 className="text-2xl font-semibold">Match criteria</h2>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Add as much context as you can. We use it to rank the closest investors.
              </p>
              <form onSubmit={handleMatch} className="mt-6 grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Industry</label>
                    <select
                      name="industry"
                      value={criteria.industry}
                      onChange={handleCriteriaChange}
                      className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-4 py-3 text-sm"
                    >
                      <option value="">Any</option>
                      {industryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Stage</label>
                    <select
                      name="stage"
                      value={criteria.stage}
                      onChange={handleCriteriaChange}
                      className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-4 py-3 text-sm"
                    >
                      <option value="">Any</option>
                      {stageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Region</label>
                    <select
                      name="geography"
                      value={criteria.geography}
                      onChange={handleCriteriaChange}
                      className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-4 py-3 text-sm"
                    >
                      <option value="">Any</option>
                      {geographyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Business model</label>
                    <select
                      name="model"
                      value={criteria.model}
                      onChange={handleCriteriaChange}
                      className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-4 py-3 text-sm"
                    >
                      <option value="">Any</option>
                      {modelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Funding ask</label>
                    <select
                      name="ticketSize"
                      value={criteria.ticketSize}
                      onChange={handleCriteriaChange}
                      className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-4 py-3 text-sm"
                    >
                      {ticketOptions.map((option) => (
                        <option key={option.label} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">Theme keywords</label>
                    <input
                      type="text"
                      name="keywords"
                      value={criteria.keywords}
                      onChange={handleCriteriaChange}
                      placeholder="automation, workflow, compliance"
                      className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="submit"
                    className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold px-6 py-3 rounded-full"
                    disabled={matching}
                  >
                    {matching ? 'Matching...' : 'Find matches'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleReset}
                    className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-full"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-white/10 rounded-3xl">
            <CardContent className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-[color:var(--ember)]" />
                <h2 className="text-2xl font-semibold">Directory snapshot</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-semibold">{investors.length}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Investors</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-semibold">{industryOptions.length}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Sectors</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-semibold">{stageOptions.length}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Stages</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-semibold">6</div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Regions</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/10 p-4">
                <h3 className="text-sm font-semibold">How to use this</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Start with your stage and funding ask, then layer in sectors and keywords. The match score
                  is a directional signal to help prioritize outreach.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-semibold">
              {matchResults ? 'Matched investors' : 'Investor directory'}
            </h2>
            <p className="text-gray-400 text-sm">
              {matchResults
                ? `Showing ${filteredInvestors.length} ranked matches.`
                : `Browse ${filteredInvestors.length} investors in the demo directory.`}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-[color:var(--accent-soft)]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search investors"
              className="bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading investor directory" />
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-rose-200">
                {error}
              </div>
            )}

            {matching && <LoadingSpinner message="Matching investors" />}

            {filteredInvestors.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-gray-300">
                No investors match this view yet. Try adjusting your criteria or search terms.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {filteredInvestors.map((investor) => {
                  const matchScore = hasMatchScore(investor) ? investor.matchScore : null;
                  const focusTags = buildFocusTags(investor);
                  const initials = getInitials(investor.name);
                  return (
                    <motion.div
                      key={investor.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <Card className="group relative overflow-hidden bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent border border-white/10 rounded-3xl">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400/70 via-emerald-400/40 to-transparent" />
                        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6">
                          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-sm font-semibold text-sky-200">
                                {initials}
                              </div>
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h3 className="text-2xl font-semibold">{investor.name}</h3>
                                  <span className="text-xs uppercase tracking-wide border border-white/10 rounded-full px-3 py-1 text-gray-300">
                                    {investor.type}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 max-w-2xl">{investor.thesis}</p>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                                  <span className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1">
                                    <Layers className="h-3 w-3 text-sky-300" />
                                    {investor.stages.join(', ')}
                                  </span>
                                  <span className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1">
                                    <MapPin className="h-3 w-3 text-emerald-300" />
                                    {investor.geography.join(', ')}
                                  </span>
                                  <span className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1">
                                    <Coins className="h-3 w-3 text-amber-300" />
                                    {investor.checkRange || fallbackCheckRange(investor.ticketMin, investor.ticketMax)}
                                  </span>
                                </div>
                                {investor.thesisKeywords && investor.thesisKeywords.length > 0 && (
                                  <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                                    {investor.thesisKeywords.slice(0, 6).map((keyword) => (
                                      <span
                                        key={keyword}
                                        className="border border-sky-500/30 bg-sky-500/10 text-sky-200 rounded-full px-3 py-1"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {matchScore !== null && (
                              <div className="flex flex-col gap-4">
                                <div className={`rounded-2xl border px-5 py-4 text-center ${scoreTone(matchScore)}`}>
                                  <div className="text-3xl font-semibold">{matchScore}</div>
                                  <div className="text-[10px] uppercase tracking-[0.3em]">Match</div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                                  {(investor as InvestorMatch).matchReasons?.slice(0, 4).map((reason) => (
                                    <span
                                      key={reason}
                                      className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1"
                                    >
                                      <Briefcase className="h-3 w-3 text-emerald-300" />
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-500">Focus</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {focusTags.slice(0, 8).map((tag) => (
                                  <span key={tag} className="border border-white/10 rounded-full px-3 py-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-500">Value add</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {investor.valueAdd.map((item) => (
                                  <span key={item} className="border border-white/10 rounded-full px-3 py-1">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-500">Notable bets</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {investor.notableInvestments.map((item) => (
                                  <span key={item} className="border border-white/10 rounded-full px-3 py-1">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default InvestorDirectory;
