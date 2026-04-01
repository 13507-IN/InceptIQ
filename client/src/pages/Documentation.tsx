import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Code, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Documentation: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const docs = [
    {
      title: 'Getting Started',
      description: 'Learn how to create your account and submit your first startup idea for analysis.',
      icon: <Zap className="h-6 w-6" />,
      steps: [
        'Sign up with your email',
        'Create a new analysis',
        'Fill in your startup details',
        'Get AI-powered insights',
      ],
    },
    {
      title: 'How Analysis Works',
      description: 'Understand how our AI analyzes your startup idea and generates detailed reports.',
      icon: <Code className="h-6 w-6" />,
      steps: [
        'Submit your startup concept',
        'AI processes your idea using Dristi AI',
        'Analysis includes market potential, risks, and recommendations',
        'Download detailed PDF report',
      ],
    },
    {
      title: 'PDF Upload Guide',
      description: 'Upload relevant documents to enhance your analysis.',
      icon: <BookOpen className="h-6 w-6" />,
      steps: [
        'Supported formats: PDF files only',
        'Maximum file size: 10MB',
        'Extract relevant information automatically',
        'Integrate data into your analysis',
      ],
    },
    {
      title: 'Your Profile & History',
      description: 'Manage your research history and track all your analyses.',
      icon: <Shield className="h-6 w-6" />,
      steps: [
        'View all your previous analyses',
        'Access past research results',
        'Download previous reports',
        'Track your startup journey',
      ],
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-[#0a122a] py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex items-center justify-center gap-3 mb-4" variants={itemVariants}>
            <BookOpen className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Documentation</h1>
          </motion.div>
          <motion.p className="text-gray-400 text-lg max-w-2xl mx-auto" variants={itemVariants}>
            Complete guide to using inceptIQ for your startup analysis and validation.
          </motion.p>
        </motion.div>

        {/* Documentation Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {docs.map((doc, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">{doc.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{doc.title}</h3>
                  <p className="text-sm text-gray-400">{doc.description}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Steps:</h4>
                <ul className="space-y-2">
                  {doc.steps.map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tips Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Pro Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <ArrowRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Be Detailed</h4>
                <p className="text-gray-400 text-sm">
                  Provide comprehensive information about your startup for better analysis.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ArrowRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Include Market Data</h4>
                <p className="text-gray-400 text-sm">
                  Share target market info for more accurate insights.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ArrowRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Use PDF Upload</h4>
                <p className="text-gray-400 text-sm">
                  Upload business plans or documents for enhanced analysis.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ArrowRight className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                <p className="text-gray-400 text-sm">
                  Keep all your analyses to track evolution of your idea.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/analysis"
            className="inline-block bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Start Your First Analysis
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Documentation;


