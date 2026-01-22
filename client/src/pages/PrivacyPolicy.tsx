import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          className="mb-12"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-gray-400">Last updated: January 22, 2026</p>
        </motion.div>

        {/* Content */}
        <motion.div
          className="space-y-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              inceptIQ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit our website
              and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Email address</li>
                  <li>Name</li>
                  <li>Password (hashed and encrypted)</li>
                  <li>Account settings and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Startup Analysis Data</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Startup idea titles and descriptions</li>
                  <li>Target market information</li>
                  <li>Business model details</li>
                  <li>Uploaded PDF documents</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Access times and pages viewed</li>
                  <li>Device information</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>To provide and improve our services</li>
              <li>To process your analysis requests</li>
              <li>To send account-related notifications</li>
              <li>To respond to your inquiries</li>
              <li>To analyze usage patterns and improve user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures including SSL encryption, secure authentication
              protocols, and regular security audits. However, no method of transmission over the internet is 100%
              secure. We protect your personal information but cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your account information and analysis data for as long as your account is active. You can
              request deletion of your account and associated data at any time by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              We use Google Gemini AI to analyze your startup ideas. Your anonymized data may be processed by these
              third-party services in accordance with their privacy policies. We do not share your personal
              information (email, name) with third parties without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data collection</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies to enhance your experience and remember your preferences. You can control cookie
              settings in your browser. See our Cookie Policy for more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy occasionally. We will notify you of significant changes via email
              or prominent notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-white font-semibold">Email: support@inceptiq.com</p>
              <p className="text-gray-400 text-sm mt-2">Response time: Within 24 hours</p>
            </div>
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
