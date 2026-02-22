import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const { user } = useContext<AuthContextValue>(AuthContext);
  const isInvestorRoute = location.pathname === '/investor' || location.pathname.startsWith('/investor/');
  const isInvestorView = user?.role === 'investor' || isInvestorRoute;

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

  if (isInvestorView) {
    return (
      <footer className="bg-[#0a122a] border-t border-sage-400/20 mt-16">
        <motion.div
          className="container mx-auto px-4 py-10"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div variants={itemVariants}>
              <Link to="/investor" className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-xl bg-sage-500/15 border border-sage-400/30">
                  <img src="/logo-main.png" alt="InceptIQ" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sand-100">Investor Portal</h3>
                  <p className="text-xs text-sand-400">Project discovery</p>
                </div>
              </Link>
              <p className="text-sm text-sand-400">
                Review community-backed projects and connect with founders directly.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="text-sm font-semibold text-sand-100 mb-3">Investor Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/investor"
                    className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                  >
                    Investor Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/investor/projects"
                    className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="text-sm font-semibold text-sand-100 mb-3">Connect</h4>
              <div className="flex gap-4 mb-3">
                <a
                  href="#linkedin"
                  className="p-2 bg-sand-100/5 hover:bg-sage-500/30 rounded-lg transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 text-sand-400 hover:text-sand-100" />
                </a>
                <a
                  href="mailto:support@inceptiq.com"
                  className="p-2 bg-sand-100/5 hover:bg-sage-500/30 rounded-lg transition-colors"
                  title="Email"
                >
                  <Mail className="h-4 w-4 text-sand-400 hover:text-sand-100" />
                </a>
              </div>
              <p className="text-xs text-sand-500">support@inceptiq.com</p>
            </motion.div>
          </div>

          <div className="border-t border-sand-200/10 my-6"></div>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-sand-400 mb-4 md:mb-0">
              <p>&copy; {currentYear} InceptIQ. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-sand-400 hover:text-sage-200 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sand-400 hover:text-sage-200 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sand-400 hover:text-sage-200 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#0a122a] border-t border-sand-200/10 mt-16">
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
            <Link to="/" className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-sand-100/10 border border-sand-100/10">
                <img src="/logo-main.png" alt="InceptIQ" className="h-6 w-6 object-contain" />
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-sand-100">InceptIQ</h3>
                  <p className="text-xs text-sand-400">AI-Powered Analysis</p>
              </div>
            </Link>
            <p className="text-sm text-sand-400">
              Validate your startup ideas with AI-powered analysis, risk mapping, and next-step guidance.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-sand-100 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/analysis"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  New Analysis
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/investor-directory"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  Investor Directory
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-sand-100 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/documentation"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-sand-400 hover:text-sage-200 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-sand-100 mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a
                href="#twitter"
                className="p-2 bg-sand-100/5 hover:bg-sage-500/30 rounded-lg transition-colors"
                title="Twitter"
              >
                <Twitter className="h-4 w-4 text-sand-400 hover:text-sand-100" />
              </a>
              <a
                href="#github"
                className="p-2 bg-sand-100/5 hover:bg-sand-500/30 rounded-lg transition-colors"
                title="GitHub"
              >
                <Github className="h-4 w-4 text-sand-400 hover:text-sand-100" />
              </a>
              <a
                href="#linkedin"
                className="p-2 bg-sand-100/5 hover:bg-sage-500/30 rounded-lg transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-sand-400 hover:text-sand-100" />
              </a>
              <a
                href="mailto:support@inceptiq.com"
                className="p-2 bg-sand-100/5 hover:bg-sage-500/30 rounded-lg transition-colors"
                title="Email"
              >
                <Mail className="h-4 w-4 text-sand-400 hover:text-sand-100" />
              </a>
            </div>
            <p className="text-xs text-sand-500">support@inceptiq.com</p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-sand-200/10 my-8"></div>

        {/* Bottom Footer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between"
        >
          <div className="text-sm text-sand-400 mb-4 md:mb-0">
            <p>&copy; {currentYear} InceptIQ. All rights reserved.</p>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-sand-400 hover:text-sage-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sand-400 hover:text-sage-200 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sand-400 hover:text-sage-200 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;


