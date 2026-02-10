import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQ: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does inceptIQ analyze my startup idea?',
      answer:
        'inceptIQ uses advanced AI (Google Gemini) to analyze your startup idea comprehensively. It evaluates market potential, identifies potential risks, provides recommendations, and assesses viability. Our AI considers industry trends, competition, and your specific market segment to provide personalized insights.',
    },
    {
      question: 'What information do I need to provide?',
      answer:
        'At minimum, provide your startup title and description. For better analysis, include target market information, business model details, funding requirements, and timeline. You can also upload PDF documents with business plans or additional information.',
    },
    {
      question: 'How long does the analysis take?',
      answer:
        'Most analyses complete within 2-5 minutes. The processing time depends on the amount of information provided and system load. You can download the results immediately after completion.',
    },
    {
      question: 'Is my data secure and private?',
      answer:
        'Yes, your data is secure. We use industry-standard encryption and secure authentication. Your analysis data is stored securely and only accessible to you. Check our Privacy Policy for more details.',
    },
    {
      question: 'Can I download my analysis results?',
      answer:
        'Yes, you can download a comprehensive PDF report of your analysis from the results page. The report includes all insights, scores, and recommendations. It\'s available anytime from your profile.',
    },
    {
      question: 'What file types are supported for upload?',
      answer:
        'Currently, we support PDF files for upload. The maximum file size is 10MB. PDF files can contain business plans, pitch decks, market research, or any relevant documentation.',
    },
    {
      question: 'Can I analyze multiple startup ideas?',
      answer:
        'Yes, you can analyze as many startup ideas as you want. Each analysis is saved to your profile, and you can access all of them anytime. This is great for comparing different business concepts.',
    },
    {
      question: 'Is there a cost to use inceptIQ?',
      answer:
        'inceptIQ is currently free to use. We believe in democratizing startup validation through AI. Premium features may be introduced in the future.',
    },
    {
      question: 'How accurate are the analysis results?',
      answer:
        'Our AI provides informed analysis based on market data, trends, and best practices. However, no analysis is 100% predictive. Use our insights as a guide alongside your own research and expert consultation.',
    },
    {
      question: 'Can I share my analysis with others?',
      answer:
        'Yes. From the results page you can invite teammates by email to collaborate. Teammates need an account to access the shared analysis. You can also download the PDF and share it manually.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0b0f1a] py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex items-center justify-center gap-3 mb-4" variants={itemVariants}>
            <HelpCircle className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Frequently Asked Questions</h1>
          </motion.div>
          <motion.p className="text-gray-400 text-lg" variants={itemVariants}>
            Find answers to common questions about inceptIQ and how to use it effectively.
          </motion.p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 hover:border-blue-500/50 rounded-lg overflow-hidden transition-all duration-300"
              variants={itemVariants}
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors text-left"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                <motion.div
                  animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-blue-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-700/50"
                  >
                    <div className="px-6 py-4 text-gray-300 bg-gray-900/30">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">Didn't find your answer?</h3>
          <p className="text-gray-400 mb-6">
            Our support team is here to help. Reach out to us for any additional questions.
          </p>
          <a
            href="/support"
            className="inline-block bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQ;


