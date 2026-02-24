import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Send,
  ArrowLeft,
  ChevronDown,
  Layers,
  Briefcase,
  Building2,
  Wallet,
  Clock3
} from 'lucide-react';
import { apiService } from '../services/api';
import { CommunityIdea, FormErrors } from '../types';

const emptyForm: CommunityIdea = {
  ideaType: '',
  ideaTitle: '',
  ideaDescription: '',
  targetMarket: '',
  businessModel: '',
  industry: '',
  budget: '',
  timeline: ''
};

const CommunityPublish: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateAnalysisId = (location.state as { analysisId?: string } | null)?.analysisId;
  const analysisId = searchParams.get('analysisId') || stateAnalysisId || null;

  const [formData, setFormData] = useState<CommunityIdea>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prefillMessage, setPrefillMessage] = useState<string | null>(null);

  const prefillIdea = useMemo(() => {
    const state = location.state as { prefillIdea?: Partial<CommunityIdea>; analysisId?: string } | null;
    return state?.prefillIdea || null;
  }, [location.state]);
  const selectShellClassName =
    'group relative rounded-xl border border-gray-700/70 bg-gradient-to-br from-gray-900/95 via-gray-900/85 to-gray-950/95 shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition-all duration-200 hover:border-blue-400/60 hover:shadow-[0_14px_36px_rgba(30,64,175,0.18)] focus-within:border-blue-400/70 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.18)]';
  const selectShellErrorClassName =
    'border-red-500/70 hover:border-red-400/90 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(248,113,113,0.22)]';
  const selectClassName =
    'analysis-select peer w-full appearance-none rounded-xl border-0 bg-transparent py-3.5 pl-11 pr-12 text-sm font-medium [color-scheme:dark] [&>option]:bg-[#0b1220] [&>option]:text-gray-100 [&>option]:py-2 [&>option:checked]:bg-blue-600 [&>option:checked]:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';
  const getSelectTextClassName = (value?: string) => (value ? 'text-gray-100' : 'text-gray-400');

  useEffect(() => {
    const loadPrefill = async () => {
      if (prefillIdea) {
        setFormData({
          ...emptyForm,
          ...prefillIdea,
          ideaType: (prefillIdea.ideaType || 'startup') as CommunityIdea['ideaType']
        });
        setPrefillMessage('Prefilled from your analysis results. You can edit before publishing.');
        return;
      }

      if (!analysisId) return;

      try {
        const response = await apiService.getAnalysis(analysisId);
        const resolved = response?.data ?? response ?? null;
        const input = resolved?.input || null;

        if (input) {
          setFormData({
            ...emptyForm,
            ...input,
            ideaType: 'startup'
          });
          setPrefillMessage('Prefilled from your analysis results. You can edit before publishing.');
        }
      } catch (error: any) {
        setSubmitError(error.message || 'Failed to load analysis data for prefill.');
      }
    };

    loadPrefill();
  }, [analysisId, prefillIdea]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.ideaType) {
      newErrors.ideaType = 'Please choose startup or hackathon';
    }
    if (!formData.ideaTitle.trim()) {
      newErrors.ideaTitle = 'Idea title is required';
    } else if (formData.ideaTitle.length < 3) {
      newErrors.ideaTitle = 'Title must be at least 3 characters long';
    }
    if (!formData.ideaDescription.trim()) {
      newErrors.ideaDescription = 'Idea description is required';
    } else if (formData.ideaDescription.length < 10) {
      newErrors.ideaDescription = 'Description must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiService.createCommunityPost({
        idea: formData,
        analysisId: analysisId || undefined
      });
      navigate('/community');
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to publish to community.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <button
          onClick={() => navigate('/community')}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Publish to Community</h1>
          <p className="text-gray-400">Share only the form details. AI analysis stays private.</p>
        </div>
      </motion.div>

      {prefillMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="text-green-300 text-sm font-medium">{prefillMessage}</p>
        </motion.div>
      )}

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm font-medium">{submitError}</p>
        </motion.div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-8">
          <label htmlFor="ideaType" className="block text-sm font-medium text-gray-300 mb-2">
            Idea Type <span className="text-red-400">*</span>
          </label>
          <div className={`${selectShellClassName} ${errors.ideaType ? selectShellErrorClassName : ''}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
            <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors duration-200 group-hover:text-blue-300 group-focus-within:text-blue-300" />
            <select
              id="ideaType"
              name="ideaType"
              value={formData.ideaType}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`${selectClassName} ${getSelectTextClassName(formData.ideaType)}`}
            >
              <option value="">Select type</option>
              <option value="startup">Startup</option>
              <option value="hackathon">Hackathon</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-gray-200 group-focus-within:text-blue-300 group-focus-within:-rotate-180" />
            </div>
          </div>
          {errors.ideaType && <p className="text-red-400 text-sm mt-2">{errors.ideaType}</p>}
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="ideaTitle" className="block text-sm font-medium text-gray-300 mb-2">
              Idea Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="ideaTitle"
              name="ideaTitle"
              value={formData.ideaTitle}
              onChange={handleInputChange}
              maxLength={200}
              disabled={isSubmitting}
              className={`w-full bg-gray-900/50 border text-white placeholder-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-all ${
                errors.ideaTitle ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.ideaTitle && <p className="text-red-400 text-sm mt-2">{errors.ideaTitle}</p>}
          </div>

          <div>
            <label htmlFor="ideaDescription" className="block text-sm font-medium text-gray-300 mb-2">
              Idea Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="ideaDescription"
              name="ideaDescription"
              value={formData.ideaDescription}
              onChange={handleInputChange}
              rows={5}
              maxLength={5000}
              disabled={isSubmitting}
              className={`w-full bg-gray-900/50 border text-white placeholder-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.ideaDescription ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.ideaDescription && <p className="text-red-400 text-sm mt-2">{errors.ideaDescription}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-300 mb-2">Target Market</label>
              <input
                type="text"
                id="targetMarket"
                name="targetMarket"
                value={formData.targetMarket}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="businessModel" className="block text-sm font-medium text-gray-300 mb-2">Business Model</label>
              <div className={selectShellClassName}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors duration-200 group-hover:text-blue-300 group-focus-within:text-blue-300" />
                <select
                  id="businessModel"
                  name="businessModel"
                  value={formData.businessModel}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`${selectClassName} ${getSelectTextClassName(formData.businessModel)}`}
                >
                  <option value="">Select business model</option>
                  <option value="subscription">Subscription</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="ecommerce">Ecommerce</option>
                  <option value="freemium">Freemium</option>
                  <option value="advertising">Advertising</option>
                  <option value="transaction">Transaction</option>
                  <option value="licensing">Licensing</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-gray-200 group-focus-within:text-blue-300 group-focus-within:-rotate-180" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <div className={selectShellClassName}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors duration-200 group-hover:text-blue-300 group-focus-within:text-blue-300" />
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`${selectClassName} ${getSelectTextClassName(formData.industry)}`}
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="services">Services</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-gray-200 group-focus-within:text-blue-300 group-focus-within:-rotate-180" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">Initial Budget Range</label>
              <div className={selectShellClassName}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
                <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors duration-200 group-hover:text-blue-300 group-focus-within:text-blue-300" />
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`${selectClassName} ${getSelectTextClassName(formData.budget)}`}
                >
                  <option value="">Select budget range</option>
                  <option value="under-10k">Under INR 10,000</option>
                  <option value="10k-50k">INR 10,000 - INR 50,000</option>
                  <option value="50k-100k">INR 50,000 - INR 100,000</option>
                  <option value="100k-500k">INR 100,000 - INR 500,000</option>
                  <option value="500k-1m">INR 500,000 - INR 1,000,000</option>
                  <option value="over-1m">Over INR 1,000,000</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-gray-200 group-focus-within:text-blue-300 group-focus-within:-rotate-180" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">Timeline to Market</label>
              <div className={selectShellClassName}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
                <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors duration-200 group-hover:text-blue-300 group-focus-within:text-blue-300" />
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`${selectClassName} ${getSelectTextClassName(formData.timeline)}`}
                >
                  <option value="">Select timeline</option>
                  <option value="3-months">3 Months</option>
                  <option value="6-months">6 Months</option>
                  <option value="1-year">1 Year</option>
                  <option value="over-1-year">Over 1 Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-gray-200 group-focus-within:text-blue-300 group-focus-within:-rotate-180" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? 'Publishing...' : 'Publish to Community'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default CommunityPublish;
