import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Loader2, Send, FileUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import { StartupIdea, FormErrors } from '../types';
import { apiService } from '../services/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.mjs`;

const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<StartupIdea>({
    ideaTitle: '',
    ideaDescription: '',
    targetMarket: '',
    businessModel: '',
    industry: '',
    budget: '',
    timeline: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfProcessedCount, setPdfProcessedCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
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

  const extractTextFromPdf = async (file: File) => {
    try {
      setIsProcessingPdf(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }

      if (!fullText.trim()) {
        throw new Error('No text found in PDF');
      }

      const result = await apiService.extractFormFieldsFromPdf(fullText);

      if (result.success && result.data) {
        const updates: Partial<StartupIdea> = {};
        let fieldCount = 0;
        
        Object.keys(result.data).forEach((key: string) => {
          if (result.data[key] && key in formData) {
            updates[key as keyof StartupIdea] = result.data[key];
            fieldCount++;
          }
        });
        
        setFormData(prev => ({ ...prev, ...updates }));
        setPdfFileName(file.name);
        setPdfProcessedCount(fieldCount);
        setSubmitError(null);
        
        setTimeout(() => {
          formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        throw new Error(result.message || 'Failed to extract form fields');
      }
    } catch (error) {
      console.error('PDF extraction failed:', error);
      setSubmitError(`Failed to extract fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setSubmitError('Please upload a valid PDF file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('PDF file must be smaller than 10MB.');
        return;
      }
      extractTextFromPdf(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiService.analyzeIdea(formData);
      navigate(`/results/${response.analysisId}`);
    } catch (error: any) {
      console.error('Analysis submission failed:', error);
      setSubmitError(error.message || 'Failed to analyze your idea. Please try again.');
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
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Analyze Your Startup Idea
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Share your startup idea with our AI-powered system to get comprehensive insights on market viability, competition, and growth potential.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* PDF Upload */}
        <motion.div 
          className="mb-10 p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border-2 border-dashed border-blue-500/50 hover:border-blue-400/75 transition-all"
        >
          <div className="flex items-center justify-center mb-4">
            <FileUp className="h-8 w-8 text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">Upload PDF Document</h2>
          </div>
          <p className="text-gray-300 text-center mb-6">
            Have a document about your startup? Upload it and our AI will automatically extract and fill form fields.
          </p>
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-blue-400 border-dashed rounded-xl cursor-pointer bg-gray-900/50 hover:bg-blue-900/20 transition-all">
            <div className="flex flex-col items-center justify-center pt-3 pb-3">
              <FileUp className="h-6 w-6 text-blue-400 mb-2" />
              <span className="text-sm text-blue-300 font-medium text-center">
                {isProcessingPdf ? '⏳ Processing PDF...' : pdfFileName ? `✓ ${pdfFileName}` : '📄 Click to upload PDF'}
              </span>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              disabled={isProcessingPdf || isSubmitting}
              className="hidden"
            />
          </label>
        </motion.div>

        {/* Divider */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <span className="text-gray-500 text-sm font-medium">OR FILL MANUALLY</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>

        {/* Success Message */}
        {pdfProcessedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-green-900/30 border border-green-500/50 rounded-lg flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm font-medium">
              Successfully extracted <strong>{pdfProcessedCount}</strong> field{pdfProcessedCount !== 1 ? 's' : ''} from your PDF
            </p>
          </motion.div>
        )}

        {/* Basic Information */}
        <motion.div 
          className="mb-10"
          ref={formSectionRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Basic Information</h2>
          </div>
          
          <div className="space-y-6">
            {/* Title */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <label htmlFor="ideaTitle" className="block text-sm font-medium text-gray-300 mb-2">
                Startup Idea Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="ideaTitle"
                name="ideaTitle"
                value={formData.ideaTitle}
                onChange={handleInputChange}
                placeholder="e.g., AI-Powered Personal Fitness Coach"
                maxLength={200}
                disabled={isSubmitting}
                className={`w-full bg-gray-900/50 border text-white placeholder-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-all ${
                  errors.ideaTitle ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.ideaTitle && <p className="text-red-400 text-sm mt-2">{errors.ideaTitle}</p>}
              <p className="text-gray-500 text-sm mt-2">{formData.ideaTitle.length}/200 characters</p>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label htmlFor="ideaDescription" className="block text-sm font-medium text-gray-300 mb-2">
                Detailed Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="ideaDescription"
                name="ideaDescription"
                value={formData.ideaDescription}
                onChange={handleInputChange}
                rows={6}
                placeholder="Describe your startup idea in detail..."
                maxLength={5000}
                disabled={isSubmitting}
                className={`w-full bg-gray-900/50 border text-white placeholder-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.ideaDescription ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.ideaDescription && <p className="text-red-400 text-sm mt-2">{errors.ideaDescription}</p>}
              <p className="text-gray-500 text-sm mt-2">{formData.ideaDescription.length}/5000 characters</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Additional Details */}
        <motion.div className="mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Additional Details</h2>
          </div>
          <p className="text-gray-400 mb-6">Provide more context for better analysis results (optional)</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-300 mb-2">Target Market</label>
              <input type="text" id="targetMarket" name="targetMarket" value={formData.targetMarket} onChange={handleInputChange} placeholder="e.g., Health-conscious millennials" disabled={isSubmitting} className="w-full bg-gray-900/50 border border-gray-700 text-white placeholder-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <label htmlFor="businessModel" className="block text-sm font-medium text-gray-300 mb-2">Business Model</label>
              <select id="businessModel" name="businessModel" value={formData.businessModel} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="">Select a business model</option>
                <option value="subscription">Subscription/SaaS</option>
                <option value="marketplace">Marketplace</option>
                <option value="ecommerce">E-commerce</option>
                <option value="freemium">Freemium</option>
                <option value="advertising">Advertising</option>
                <option value="transaction">Transaction-based</option>
                <option value="licensing">Licensing</option>
                <option value="other">Other</option>
              </select>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <select id="industry" name="industry" value={formData.industry} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="">Select an industry</option>
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
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">Initial Budget Range</label>
              <select id="budget" name="budget" value={formData.budget} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="">Select budget range</option>
                <option value="under-10k">Under $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="500k-1m">$500,000 - $1,000,000</option>
                <option value="over-1m">Over $1,000,000</option>
              </select>
            </motion.div>

            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">Expected Timeline to Market</label>
              <select id="timeline" name="timeline" value={formData.timeline} onChange={handleInputChange} disabled={isSubmitting} className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="">Select timeline</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">3-6 months</option>
                <option value="1-year">6-12 months</option>
                <option value="over-1-year">Over 1 year</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Error */}
        {submitError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{submitError}</p>
          </motion.div>
        )}
        
        {/* Submit */}
        <motion.div className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Your Idea...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Start AI Analysis
              </>
            )}
          </motion.button>
          <p className="text-gray-400 text-sm mt-4 text-center max-w-md">
            ⏱️ Analysis typically takes 30-60 seconds. Please be patient while our AI processes your idea.
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default Analysis;
