import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Mail, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';

const InvestorLanding: React.FC = () => {
  const { user } = useContext<AuthContextValue>(AuthContext);
  const isInvestor = user?.role === 'investor';
  const primaryCta = isInvestor ? '/investor/projects' : '/investor/login';
  const primaryLabel = isInvestor ? 'Go to Projects' : 'Investor Sign In';

  const highlights = [
    {
      icon: TrendingUp,
      title: 'Signal-ranked deal flow',
      description: 'Upvotes, downvotes, and community likes surface the highest-conviction projects first.'
    },
    {
      icon: ShieldCheck,
      title: 'Founder-first transparency',
      description: 'Review structured project summaries without extra noise or gated extras.'
    },
    {
      icon: Mail,
      title: 'Direct founder contact',
      description: 'Email project owners instantly from the Projects board when you are ready to engage.'
    }
  ];

  const workflow = [
    {
      title: 'Browse projects',
      description: 'Scan new founder submissions with clear summaries and community sentiment.'
    },
    {
      title: 'Vote with conviction',
      description: 'Upvote, downvote, and like to improve signal quality for the community.'
    },
    {
      title: 'Reach out',
      description: 'Contact owners directly by email to start the conversation.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a122a] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.4),rgba(15,23,42,0.9))]" />

        <div className="container mx-auto px-6 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs uppercase tracking-[0.2em] text-emerald-200 mb-6">
              <Sparkles className="h-4 w-4" />
              Investor Portal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Discover high-signal projects
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300">
                before they trend
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl">
              A focused workspace for investors to review community-backed startup ideas, track momentum, and connect
              directly with founders.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to={primaryCta}
                className="inline-flex items-center justify-center gap-2 bg-emerald-400 text-black font-semibold px-6 py-3 rounded-full hover:bg-emerald-300 transition"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/investor/projects"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/10 transition"
              >
                View Projects
                <Briefcase className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-700/60 rounded-2xl p-6"
            >
              <item.icon className="h-6 w-6 text-emerald-300" />
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-[#0a122a] via-[#111b36] to-[#0a122a]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl font-semibold">Investor workflow, simplified</h2>
              <p className="mt-4 text-gray-300 max-w-lg">
                Everything you need to review, evaluate, and connect with founders is in one place. No extra sections,
                no distractions.
              </p>
            </div>
            <div className="lg:w-1/2 grid gap-5">
              {workflow.map((step, idx) => (
                <div
                  key={step.title}
                  className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-5"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-200 mb-2">
                    Step {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/20 via-sky-500/10 to-blue-500/10 p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold">Start reviewing projects today</h3>
              <p className="mt-3 text-gray-200 max-w-xl">
                Sign in to the investor portal and explore the latest community projects with built-in voting signals.
              </p>
            </div>
            <Link
              to={primaryCta}
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestorLanding;
