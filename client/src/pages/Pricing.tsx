import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Star, Users } from 'lucide-react';

const Pricing: React.FC = () => {
  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Validate early ideas and share with the community.',
      cta: 'Start Free',
      ctaLink: '/analysis',
      highlight: false,
      features: ['1 analysis per day', 'Community publishing', 'PDF export']
    },
    {
      name: 'Growth',
      price: '$29/mo',
      description: 'For founders running multiple validations each week.',
      cta: 'Upgrade to Growth',
      ctaLink: '/support',
      highlight: true,
      features: ['Unlimited analyses', 'Team collaboration', 'Priority AI queue']
    },
    {
      name: 'Scale',
      price: 'Custom',
      description: 'For accelerators and startup studios.',
      cta: 'Talk to Sales',
      ctaLink: '/support',
      highlight: false,
      features: ['Multi-team workspaces', 'Advanced exports', 'Dedicated support']
    }
  ];

  const faqs = [
    {
      question: 'Can I stay on the free plan forever?',
      answer: 'Yes. The Starter plan is free with daily limits. Upgrade only when you need more throughput.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'If you are unhappy, reach out within 14 days and we will make it right.'
    },
    {
      question: 'Is my data private?',
      answer: 'Your analysis data stays private and is only accessible by you and invited collaborators.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),transparent_55%)]" />
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.2em] text-blue-200">
            <Sparkles className="h-4 w-4" />
            Pricing
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold max-w-3xl">
            Simple pricing that scales with your momentum
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl">
            Start validating ideas today. Upgrade when you need more volume, collaboration, or speed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button className="bg-blue-500 hover:bg-blue-400 text-black font-semibold px-6 py-3 rounded-full" asChild>
              <Link to="/analysis" className="flex items-center gap-2">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-full" asChild>
              <Link to="/support">Talk to us</Link>
            </Button>
          </div>
        </div>

        <svg
          className="absolute -top-24 right-0 w-[420px] h-[420px] opacity-40"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M40 120C120 60 220 60 300 140" stroke="#60A5FA" strokeWidth="2" strokeDasharray="6 12" />
          <circle cx="220" cy="200" r="100" stroke="#22D3EE" strokeWidth="2" />
          <circle cx="220" cy="200" r="60" stroke="#34D399" strokeWidth="2" />
        </svg>
      </section>

      {/* Pricing grid */}
      <section className="py-16">
        <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`bg-white/5 border ${tier.highlight ? 'border-blue-400/40' : 'border-white/10'} rounded-3xl`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  {tier.highlight && (
                    <span className="text-xs text-blue-200 bg-blue-500/10 border border-blue-400/40 px-2 py-1 rounded-full">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="mt-4 text-3xl font-semibold">{tier.price}</div>
                <p className="mt-3 text-gray-400 text-sm">{tier.description}</p>
                <Button
                  className={`mt-6 w-full ${tier.highlight ? 'bg-blue-500 hover:bg-blue-400 text-black' : 'bg-white/10 text-white'}`}
                  asChild
                >
                  <Link to={tier.ctaLink}>{tier.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-2 text-sm text-gray-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Value highlights */}
      <section className="py-16 bg-gradient-to-b from-[#05060a] via-[#0b1220] to-[#05060a]">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-6">
              <Star className="h-6 w-6 text-amber-300" />
              <h4 className="mt-4 text-lg font-semibold">Founder-grade insights</h4>
              <p className="mt-2 text-sm text-gray-400">Actionable strategies, not generic market blurbs.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              <h4 className="mt-4 text-lg font-semibold">Risk-first planning</h4>
              <p className="mt-2 text-sm text-gray-400">Spot red flags early and plan mitigations fast.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="p-6">
              <Users className="h-6 w-6 text-blue-300" />
              <h4 className="mt-4 text-lg font-semibold">Team ready</h4>
              <p className="mt-2 text-sm text-gray-400">Bring collaborators into the same decision loop.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-8">Pricing FAQ</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {faqs.map((faq) => (
              <Card key={faq.question} className="bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold">{faq.question}</h4>
                  <p className="mt-3 text-sm text-gray-400">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-emerald-400/10 p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold">Ready to validate your next big move?</h2>
              <p className="mt-3 text-gray-300 max-w-xl">
                Start your first analysis in minutes and upgrade when you need more power.
              </p>
            </div>
            <Button className="bg-white text-black font-semibold px-6 py-3 rounded-full" asChild>
              <Link to="/analysis" className="flex items-center gap-2">
                Launch Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
