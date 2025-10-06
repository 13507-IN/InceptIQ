import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, FileText, Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { AuroraBackground } from '../components/ui/aurora-bg';
import { SparklesCore } from '../components/ui/sparkles';
import { GlowingEffect } from '../components/ui/glowing-effect';
// If the file exists at client/src/components/ui/glowing-effect.tsx, keep this import.
// Otherwise, update the path to the correct location, for example:
//import { GlowingEffect } from '../components/ui/glowing-effect';
// Or, if the file is named differently or in a different folder, adjust accordingly:
// import { GlowingEffect } from '../components/GlowingEffect';

const Home: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Leverage Google Gemini\'s advanced AI for deep market insights and predictive analytics.',
      gradient: 'from-purple-500 to-blue-500'
    },
    {
      icon: Target,
      title: 'Market Viability',
      description: 'Understand your target market size, growth potential, and competitive landscape.',
      gradient: 'from-green-500 to-cyan-500'
    },
    {
      icon: FileText,
      title: 'PDF Reports',
      description: 'Download comprehensive, professional analysis reports with actionable insights.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // loosen typing (framer-motion strict typing can be noisy here)
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        // use a numeric cubic-bezier array which satisfies the Transition type
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white overflow-hidden">
      {/* Hero Section with Aurora Background */}
      <AuroraBackground>
        <section className="relative py-32">
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 mb-8"
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white font-medium">Powered by AI</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                className="text-6xl md:text-8xl text-white font-bold mb-8 leading-tight"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Validate Your
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mt-4">
                  Startup Idea
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed max-w-4xl mx-auto"
              >
                Get comprehensive market analysis, competitive insights, and actionable recommendations 
                powered by cutting-edge artificial intelligence.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold text-lg px-12 py-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  <Link to="/analysis" className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Start Free Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Animated Sparkles Background */}
          <div className="absolute inset-0 -z-10">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
          </div>
        </section>
      </AuroraBackground>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            >
              Why Choose AI Startup Validator?
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              Our platform combines cutting-edge AI technology with proven business frameworks 
              to give your startup the best chance of success.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="relative group"
              >
                <GlowingEffect 
                  className="rounded-3xl"
                  spread={40}
                  glow={true}
                  disabled={false}
                />
                <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50 rounded-3xl p-8 group-hover:bg-gray-800/50 transition-all duration-300 h-full">
                  <CardContent className="p-0 text-center">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Ready to Validate Your Idea?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who've transformed their ideas into successful ventures with AI-powered insights.
            </p>
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold text-lg px-12 py-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <Link to="/analysis" className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Start Your Analysis Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;