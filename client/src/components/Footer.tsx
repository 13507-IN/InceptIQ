import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700/50 mt-16">
      <motion.div
        className="container mx-auto px-4 py-12"
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  inceptIQ
                </h3>
                <p className="text-xs text-gray-500">AI-Powered Analysis</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400">
              Validate your startup ideas with AI-powered analysis and insights.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/analysis"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  New Analysis
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/documentation"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a
                href="#twitter"
                className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                title="Twitter"
              >
                <Twitter className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
              <a
                href="#github"
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title="GitHub"
              >
                <Github className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
              <a
                href="#linkedin"
                className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
              <a
                href="mailto:support@inceptiq.com"
                className="p-2 bg-gray-800 hover:bg-purple-600 rounded-lg transition-colors"
                title="Email"
              >
                <Mail className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
            </div>
            <p className="text-xs text-gray-500">support@inceptiq.com</p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700/50 my-8"></div>

        {/* Bottom Footer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between"
        >
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            <p>
              © {currentYear} inceptIQ. All rights reserved. | Made with{' '}
              <span className="text-red-500">❤️</span> for entrepreneurs
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
