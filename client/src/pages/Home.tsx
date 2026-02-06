import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, Rocket, Sparkles, ShieldCheck, LineChart, Users, CheckCircle2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Home: React.FC = () => {
  const { token } = useContext<AuthContextValue>(AuthContext);
  const [requests, setRequests] = useState<any[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const resp = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.data && resp.data.requests) setRequests(resp.data.requests || []);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
      });
      gsap.from('.hero-subtitle', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.15
      });
      gsap.from('.hero-cta', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.3
      });
      gsap.from('.hero-image', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.25
      });

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%'
            }
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      title: 'Describe the idea',
      description: 'Share your concept, market, and business model in one focused form.'
    },
    {
      title: 'AI deep scan',
      description: 'Gemini analyzes uniqueness, market viability, and competitive pressure.'
    },
    {
      title: 'Actionable strategy',
      description: 'Get a clear score, risks, and next steps you can execute today.'
    }
  ];

  const highlights = [
    {
      icon: LineChart,
      title: 'Market clarity',
      description: 'Understand market size, demand signals, and the strongest entry angle.'
    },
    {
      icon: ShieldCheck,
      title: 'Risk mapping',
      description: 'Identify blind spots early and get mitigation tactics tailored to your idea.'
    },
    {
      icon: Users,
      title: 'Competition radar',
      description: 'See where you can win and where you should differentiate.'
    }
  ];

  const metrics = [
    { label: 'Ideas analyzed', value: '18K+' },
    { label: 'Avg. report time', value: '45 sec' },
    { label: 'Founder satisfaction', value: '4.9/5' }
  ];

  return (
    <div ref={rootRef} className="min-h-screen bg-[#05060a] text-white">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.5),rgba(17,24,39,0.9))]" />

        <svg
          className="absolute -top-24 right-0 w-[520px] h-[520px] opacity-40"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 20C100 20 20 100 20 200C20 300 100 380 200 380C300 380 380 300 380 200"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="6 14"
          />
          <circle cx="200" cy="200" r="110" stroke="#22D3EE" strokeWidth="2" />
          <circle cx="200" cy="200" r="60" stroke="#F59E0B" strokeWidth="2" />
        </svg>

        <div className="container mx-auto px-6 py-20 relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.2em] text-blue-200 mb-6 hero-subtitle">
              <Sparkles className="h-4 w-4" />
              AI Startup Validator
            </div>
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Turn raw startup ideas into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                investor-ready strategies
              </span>
            </h1>
            <p className="hero-subtitle mt-6 text-lg text-gray-300 max-w-xl">
              Explore the market, uncover risks, and get an AI playbook in minutes. Built for founders who want
              clarity before they commit time and money.
            </p>
            <div className="hero-cta mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-500 hover:bg-blue-400 text-black font-semibold px-6 py-3 rounded-full" asChild>
                <Link to="/analysis" className="flex items-center gap-2">
                  Start Free Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-full" asChild>
                <Link to="/community" className="flex items-center gap-2">
                  Explore Community
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-400">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="text-xl font-semibold text-white">{metric.value}</div>
                  <div>{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-image relative">
            <Card className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Insight Snapshot</span>
                    <span className="text-emerald-300">Live</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <img
                    src="/Untitled design (1).png"
                    alt="Analytics preview"
                    className="w-full rounded-2xl object-cover border border-white/10"
                  />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-gray-400">Overall score</div>
                      <div className="text-2xl font-semibold text-emerald-300">82</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="text-gray-400">Time to market</div>
                      <div className="text-2xl font-semibold text-blue-200">10 weeks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="absolute -bottom-10 -left-10 bg-[#0f172a] border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="text-sm">
                  <div className="text-white font-semibold">Report ready</div>
                  <div className="text-gray-400">PDF export in one click</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Steps */}
      <section className="reveal py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl font-semibold">A founder-friendly strategy workflow</h2>
              <p className="mt-4 text-gray-400 max-w-lg">
                Build momentum fast with a structured path from idea to actionable plan. Each section is
                designed to reduce ambiguity and accelerate your next move.
              </p>
            </div>
            <div className="lg:w-1/2 grid gap-6">
              {steps.map((step, index) => (
                <Card key={step.title} className="feature-card bg-white/5 border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-sm font-semibold text-blue-300 bg-blue-500/10 rounded-full px-3 py-1">
                        Step {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        <p className="text-gray-400 mt-2">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="reveal py-24 bg-gradient-to-b from-[#05060a] via-[#0b1220] to-[#05060a]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold">Deep intelligence, not generic advice</h2>
            <p className="mt-4 text-gray-400">
              Each report connects market data with your inputs to deliver a grounded plan you can trust.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {highlights.map((item) => (
              <Card key={item.title} className="feature-card bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <item.icon className="h-7 w-7 text-cyan-300" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-gray-400 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="reveal py-24">
        <div className="container mx-auto px-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold">Built for solo founders and fast teams</h2>
            <p className="mt-4 text-gray-400">
              Validate new ideas, explore pivots, and align your team with a shared strategy output.
            </p>
            <div className="mt-6 space-y-3">
              {['Shareable PDF reports', 'Community feedback loop', 'Team collaboration tools'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl" />
            <img
              src="/logo512.png"
              alt="Brand mark"
              className="w-40 h-40 rounded-3xl border border-white/10 bg-white/5 p-6"
            />
            <div className="mt-8 grid gap-4">
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-5">
                  <p className="text-sm text-gray-400">"We used the report to prep for our seed deck in 48 hours."</p>
                  <p className="mt-3 text-sm text-white">- Ari, B2B SaaS founder</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border border-white/10">
                <CardContent className="p-5">
                  <p className="text-sm text-gray-400">"It helped us spot a go-to-market gap before launch."</p>
                  <p className="mt-3 text-sm text-white">- Miko, Marketplace builder</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="reveal py-24 bg-[#0b1120]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold">Simple, transparent pricing</h2>
          <p className="mt-4 text-gray-400">Start free today. Upgrade only when you need advanced insights.</p>
          <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="p-6">
                <div className="text-sm uppercase text-gray-400">Starter</div>
                <div className="text-3xl font-semibold mt-2">Free</div>
                <p className="mt-3 text-gray-400">Perfect for exploring new ideas.</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-300">
                  <li>1 analysis per day</li>
                  <li>Community publishing</li>
                  <li>PDF export</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/20 to-emerald-400/10 border border-blue-400/30">
              <CardContent className="p-6">
                <div className="text-sm uppercase text-blue-200">Growth</div>
                <div className="text-3xl font-semibold mt-2">$29/mo</div>
                <p className="mt-3 text-gray-300">For teams running multiple validations.</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-200">
                  <li>Unlimited analyses</li>
                  <li>Team collaboration</li>
                  <li>Priority AI queue</li>
                </ul>
                <div className="mt-6">
                  <Button className="bg-white text-black font-semibold px-4 py-2 rounded-full" asChild>
                    <Link to="/pricing" className="flex items-center gap-2">
                      View full pricing
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="reveal py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-emerald-400/10 p-12">
            <div className="absolute inset-0 opacity-30">
              <svg width="100%" height="100%" viewBox="0 0 600 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 180C120 140 240 220 360 180C480 140 600 200 720 160" stroke="#38BDF8" strokeWidth="2" />
              </svg>
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-semibold">Ready to validate your next big move?</h2>
              <p className="mt-4 text-gray-300 max-w-xl">
                Start your analysis in minutes and turn your idea into a clear, actionable strategy.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-black font-semibold px-6 py-3 rounded-full" asChild>
                  <Link to="/analysis" className="flex items-center gap-2">
                    Launch Analysis
                    <Rocket className="h-4 w-4" />
                  </Link>
                </Button>
                <Button className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-full" asChild>
                  <Link to="/documentation">See how it works</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent analyses */}
      {requests && requests.length > 0 && (
        <section className="reveal py-20">
          <div className="container mx-auto px-6">
            <h3 className="text-2xl font-semibold mb-6">Your recent analyses</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {requests.map((r) => (
                <Card key={r.id} className="bg-white/5 border border-white/10">
                  <CardContent className="p-5">
                    <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="text-lg font-semibold mt-2">{r.input?.ideaTitle || 'Untitled'}</div>
                    <div className="text-sm text-gray-400 mt-2">
                      {(r.input?.ideaDescription || '').slice(0, 140)}
                      {(r.input?.ideaDescription || '').length > 140 ? '...' : ''}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
