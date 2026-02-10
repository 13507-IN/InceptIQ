import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, User, Send, CheckCircle } from 'lucide-react';

const Support: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      console.log('Support message submitted:', formData);
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: '', email: '', message: '' });

      // Reset form after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

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

  return (
    <motion.div
      className="min-h-screen bg-[#0b0f1a] py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex items-center justify-center gap-3 mb-4" variants={itemVariants}>
            <Mail className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Support & Contact Us</h1>
          </motion.div>
          <motion.p className="text-gray-400 text-lg max-w-2xl mx-auto" variants={itemVariants}>
            Have questions or need assistance? We're here to help. Send us a message and we'll get back to you as soon as possible.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-lg p-6"
              variants={itemVariants}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Email</h3>
                  <p className="text-gray-400">support@inceptiq.com</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Send us an email and we'll respond within 24 hours.
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-lg p-6"
              variants={itemVariants}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Response Time</h3>
                  <p className="text-gray-400">Within 24 hours</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                We typically respond to all inquiries within one business day.
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 backdrop-blur-xl border border-blue-500/30 rounded-lg p-6"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold text-white mb-3">Common Issues</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Account & Authentication
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Analysis Issues
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Download & Reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Feature Requests
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-lg p-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Thank you!</h3>
                <p className="text-gray-400 text-center">
                  Your message has been sent successfully. We'll get back to you soon.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="How can we help you?"
                      rows={5}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Support;


