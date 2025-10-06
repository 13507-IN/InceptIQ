import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Loader2, Send } from 'lucide-react';
import { StartupIdea, FormErrors } from '../types';
import { apiService } from '../services/api';

const Analysis: React.FC = () => {
  const navigate = useNavigate();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiService.analyzeIdea(formData);
      console.log('Analysis response:', response);
      
      // Navigate to results page with analysis ID
      navigate(`/results/${response.analysisId}`);
    } catch (error: any) {
      console.error('Analysis submission failed:', error);
      setSubmitError(error.message || 'Failed to analyze your idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Lightbulb className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Analyze Your Startup Idea
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Share your startup idea with our AI-powered analysis system to get comprehensive 
          insights on market viability, competition, and growth potential.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
        {/* Required Fields */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid md:grid-cols-1 gap-6">
            <div>
              <label htmlFor="ideaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Startup Idea Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ideaTitle"
                name="ideaTitle"
                value={formData.ideaTitle}
                onChange={handleInputChange}
                placeholder="e.g., AI-Powered Personal Fitness Coach"
                maxLength={200}
                className={`form-input ${errors.ideaTitle ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.ideaTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.ideaTitle}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.ideaTitle.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="ideaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="ideaDescription"
                name="ideaDescription"
                value={formData.ideaDescription}
                onChange={handleInputChange}
                rows={6}
                placeholder="Describe your startup idea in detail. Include the problem you're solving, your solution, and how it works..."
                maxLength={5000}
                className={`form-textarea ${errors.ideaDescription ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.ideaDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.ideaDescription}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.ideaDescription.length}/5000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Additional Details</h2>
          <p className="text-gray-600 mb-6">
            Provide more context to get better analysis results (optional)
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700 mb-2">
                Target Market
              </label>
              <input
                type="text"
                id="targetMarket"
                name="targetMarket"
                value={formData.targetMarket}
                onChange={handleInputChange}
                placeholder="e.g., Health-conscious millennials, Small businesses"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="businessModel" className="block text-sm font-medium text-gray-700 mb-2">
                Business Model
              </label>
              <select
                id="businessModel"
                name="businessModel"
                value={formData.businessModel}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
              >
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
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
              >
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
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Initial Budget Range
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
              >
                <option value="">Select budget range</option>
                <option value="under-10k">Under $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="500k-1m">$500,000 - $1,000,000</option>
                <option value="over-1m">Over $1,000,000</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Timeline to Market
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                className="form-input"
                disabled={isSubmitting}
              >
                <option value="">Select timeline</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">3-6 months</option>
                <option value="1-year">6-12 months</option>
                <option value="over-1-year">Over 1 year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center">
          {submitError && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary w-full md:w-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing Your Idea...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Start AI Analysis
              </>
            )}
          </button>
          
          <p className="text-gray-500 text-sm mt-3 text-center">
            Analysis typically takes 30-60 seconds. Please be patient while our AI processes your idea.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Analysis;
