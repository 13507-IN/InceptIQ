import React from 'react';
import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

const CookiePolicy: React.FC = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0a122a] py-12"
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
            <Cookie className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
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
            <h2 className="text-2xl font-bold text-white mb-4">1. What are Cookies?</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small files placed on your device when you visit our website. They help us remember your
              preferences, understand how you use our service, and improve your experience. Most web browsers accept
              cookies by default, but you can change your settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Essential Cookies</h3>
                <p className="text-gray-300">
                  Required for the website to function properly. These cookies enable core functionality such as
                  security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Functional Cookies</h3>
                <p className="text-gray-300">
                  Remember your preferences and settings to provide a customized experience. This includes language
                  preferences, authentication tokens, and user theme preferences.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Analytics Cookies</h3>
                <p className="text-gray-300">
                  Help us understand how visitors use our website, which pages are most popular, and track
                  performance. This helps us improve our service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Marketing Cookies</h3>
                <p className="text-gray-300">
                  Track your activity across websites to show you relevant advertisements. These are optional and
                  can be disabled.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cookie Data We Collect</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Authentication tokens to keep you logged in</li>
              <li>User preferences (theme, language, display settings)</li>
              <li>Session information</li>
              <li>Analytics data (pages visited, time spent, referrer)</li>
              <li>Your IP address and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              We may use third-party services such as Google Analytics to analyze website usage. These services may
              set their own cookies on your device. We do not control third-party cookies and encourage you to
              review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. How to Control Cookies</h2>
            <div className="space-y-3">
              <p className="text-gray-300">You can control and/or delete cookies in several ways:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>
                  <strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or alert you when
                  cookies are being sent. Refer to your browser's help file or support page.
                </li>
                <li>
                  <strong>Opt-Out:</strong> You can opt-out of Google Analytics by installing the Google Analytics
                  Opt-out Browser Add-on.
                </li>
                <li>
                  <strong>Cookie Management:</strong> You can delete cookies from your device at any time through
                  your browser settings.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Essential Cookies Notice</h2>
            <p className="text-gray-300 leading-relaxed">
              Please note that if you disable essential cookies, some features of our website may not work properly.
              These cookies are necessary for security and basic functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookie Duration</h2>
            <div className="space-y-3">
              <p className="text-gray-300">
                Cookies have different lifespans:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>
                  <strong>Session Cookies:</strong> Deleted when you close your browser
                </li>
                <li>
                  <strong>Persistent Cookies:</strong> Remain on your device for a specified period (typically 1-2
                  years)
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Updates to Cookie Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or technology.
              We will notify you of any significant changes via email or prominent notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about our cookie practices, please contact us:
            </p>
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-white font-semibold">Email: support@inceptiq.com</p>
              <p className="text-gray-400 text-sm mt-2">Privacy Team</p>
              <p className="text-gray-400 text-sm">Response time: Within 24 hours</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Cookie Consent</h2>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-gray-300">
                By continuing to use inceptIQ, you consent to our use of cookies as described in this policy. If you
                do not agree to our cookie practices, please disable cookies in your browser or discontinue use of
                our website.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CookiePolicy;

