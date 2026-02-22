import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, Rocket, Sparkles, ShieldCheck, LineChart, Users, CheckCircle2, PenTool, BrainCircuit, Flag, Lightbulb, Clock, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const metricFormatter = new Intl.NumberFormat('en-US');

const formatMetricValue = (value: number, decimals: number, suffix: string) => {
  const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  const [intPart, decimalPart] = fixed.split('.');
  const formattedInt = metricFormatter.format(Number(intPart || 0));
  const formatted = decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt;
  return `${formatted}${suffix}`;
};

const Home: React.FC = () => {
  const { token } = useContext<AuthContextValue>(AuthContext);
  const [requests, setRequests] = useState<any[]>([]);
  const [introDone, setIntroDone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const analysisCtaHref = token ? '/analysis' : '/login';
  const analysisCtaLabel = token ? 'Start Free Analysis' : 'Sign in to start';
  const finalCtaLabel = token ? 'Launch Analysis' : 'Sign in to start';

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
    let isMounted = true;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          if (isMounted) setIntroDone(true);
        }
      });

      gsap.set('.home-content', { opacity: 0 });
      gsap.set('.intro-center', { opacity: 0, scale: 0.85 });
      gsap.set('.intro-piece', { opacity: 0, scale: 0.85 });
      gsap.set('.intro-top', { y: -160 });
      gsap.set('.intro-bottom', { y: 160 });
      gsap.set('.intro-left', { x: -160 });
      gsap.set('.intro-right', { x: 160 });

      introTl
        .to('.intro-piece', { opacity: 1, duration: 0.6, stagger: 0.12 }, 0)
        .to('.intro-top', { y: 0, duration: 1.1 }, 0)
        .to('.intro-bottom', { y: 0, duration: 1.1 }, 0)
        .to('.intro-left', { x: 0, duration: 1.1 }, 0)
        .to('.intro-right', { x: 0, duration: 1.1 }, 0)
        .to('.intro-center', { opacity: 1, scale: 1, duration: 0.9 }, 0.35)
        .to('.home-content', { opacity: 1, duration: 0.9 }, 1.6)
        .to('.intro-overlay', { opacity: 0, duration: 0.8 }, 1.9)
        .set('.intro-overlay', { display: 'none' }, 2.8);

      const heroDelay = 1.6;
      gsap.from('.hero-title', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        delay: heroDelay
      });
      gsap.from('.hero-subtitle', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: heroDelay + 0.15
      });
      gsap.from('.hero-badge', {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: heroDelay + 0.05
      });
      gsap.from('.hero-cta', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: heroDelay + 0.3
      });
      gsap.from('.hero-metrics', {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: heroDelay + 0.45
      });
      gsap.from('.hero-image', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: heroDelay + 0.25
      });

      gsap.to('.float-slow', {
        y: -12,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });

      gsap.to('.float-fast', {
        y: -16,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });

      gsap.to('.hero-orbit', {
        rotate: 6,
        transformOrigin: '50% 50%',
        duration: 12,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
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

      gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            delay: 0.4 + i * 0.1
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.metric-value').forEach((el) => {
        const endValue = Number(el.dataset.value || '0');
        const decimals = Number(el.dataset.decimals || '0');
        const suffix = el.dataset.suffix || '';
        const counter = { value: 0 };

        gsap.to(counter, {
          value: endValue,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          onUpdate: () => {
            el.textContent = formatMetricValue(counter.value, decimals, suffix);
          }
        });
      });

      gsap.utils.toArray<HTMLElement>('.parallax').forEach((el) => {
        const speed = Number(el.dataset.speed || '0.2');
        gsap.to(el, {
          y: -80 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });

      gsap.utils.toArray<HTMLElement>('.tilt-card').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0, rotate: -1 },
          {
            y: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%'
            }
          }
        );
      });
    }, rootRef);

    return () => {
      isMounted = false;
      ctx.revert();
    };
  }, []);

  const steps = [
    {
      title: 'Describe the idea',
      description: 'Share your concept, market, and business model in one focused form.',
      icon: PenTool
    },
    {
      title: 'AI deep scan',
      description: 'Gemini analyzes uniqueness, market viability, and competitive pressure.',
      icon: BrainCircuit
    },
    {
      title: 'Actionable strategy',
      description: 'Get a clear score, risks, and next steps you can execute today.',
      icon: Flag
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
    { label: 'Ideas analyzed', value: 18000, suffix: '+', decimals: 0, icon: Lightbulb },
    { label: 'Avg. report time', value: 45, suffix: ' sec', decimals: 0, icon: Clock },
    { label: 'Founder satisfaction', value: 4.9, suffix: '/5', decimals: 1, icon: Star }
  ];

  return (
    <div ref={rootRef} className="min-h-screen bg-[#0a122a] text-sand-200">
      {!introDone && (
        <div className="intro-overlay fixed inset-0 z-[60] flex items-center justify-center bg-[#0a122a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(104,143,63,0.25),transparent_60%)]" />
          <div className="relative h-72 w-72">
            <img
              src="/logo-main.png"
              alt="InceptIQ logo"
              className="intro-piece intro-top absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 opacity-0"
            />
            <img
              src="/logo-main.png"
              alt="InceptIQ logo"
              className="intro-piece intro-bottom absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 opacity-0"
            />
            <img
              src="/logo-main.png"
              alt="InceptIQ logo"
              className="intro-piece intro-left absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 opacity-0"
            />
            <img
              src="/logo-main.png"
              alt="InceptIQ logo"
              className="intro-piece intro-right absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 opacity-0"
            />
            <img
              src="/logo-main.png"
              alt="InceptIQ logo"
              className="intro-center absolute left-1/2 top-1/2 h-54 w-54 -translate-x-1/2 -translate-y-1/2 opacity-0"
            />
          </div>
          <div className="absolute bottom-16 text-xs uppercase tracking-[0.4em] text-sand-400">
            Loading insights
          </div>
        </div>
      )}

      <div className="home-content">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(104,143,63,0.25),transparent_55%)] parallax"
          data-speed="0.15"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,18,42,0.6),rgba(10,18,42,0.95))]" />

        <svg
          className="absolute -top-24 right-0 w-[520px] h-[520px] opacity-40 hero-orbit parallax"
          data-speed="0.25"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 20C100 20 20 100 20 200C20 300 100 380 200 380C300 380 380 300 380 200"
            stroke="#688F3F"
            strokeWidth="2"
            strokeDasharray="6 14"
          />
          <circle cx="200" cy="200" r="110" stroke="#E7DECD" strokeWidth="2" />
          <circle cx="200" cy="200" r="60" stroke="#9CB85F" strokeWidth="2" />
        </svg>

        <div className="container mx-auto px-6 py-20 relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sand-100/10 border border-sand-100/10 text-xs uppercase tracking-[0.2em] text-sage-200 mb-6 hero-subtitle hero-badge">
              <Sparkles className="h-4 w-4" />
              AI Startup Validator
            </div>
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Turn raw startup ideas into
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sage-300 via-sand-200 to-sage-500">
                investor-ready strategies
              </span>
            </h1>
            <p className="hero-subtitle mt-6 text-lg text-sand-300 max-w-xl">
              Explore the market, uncover risks, and get an AI playbook in minutes. Built for founders who want
              clarity before they commit time and money.
            </p>
            <div className="hero-cta mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="bg-sage-500 hover:bg-sage-400 text-ink-900 font-semibold px-6 py-3 rounded-full" asChild>
                <Link to={analysisCtaHref} className="flex items-center gap-2">
                  {analysisCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button className="bg-transparent border border-sand-200/40 text-sand-100 px-6 py-3 rounded-full" asChild>
                <Link to="/community" className="flex items-center gap-2">
                  Explore Community
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3 hero-metrics">
              {metrics.map((metric) => {
                const MetricIcon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="stat-card flex items-center gap-4 rounded-2xl border border-sand-100/10 bg-sand-100/5 px-4 py-3"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-500/15 border border-sage-400/30">
                      <MetricIcon className="h-5 w-5 text-sage-300" />
                    </div>
                    <div>
                      <div
                        className="metric-value text-xl font-semibold text-sand-100"
                        data-value={metric.value}
                        data-decimals={metric.decimals}
                        data-suffix={metric.suffix}
                      >
                        {formatMetricValue(0, metric.decimals, metric.suffix)}
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-sand-400">{metric.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hero-image relative">
            <Card className="bg-sand-100/5 border border-sand-100/10 rounded-3xl overflow-hidden float-slow">
              <CardContent className="p-0">
                <div className="p-6 border-b border-sand-100/10">
                  <div className="flex items-center justify-between text-sm text-sand-300">
                    <span>Insight Snapshot</span>
                    <span className="text-sage-300">Live</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <img
                    src="/download.jpg"
                    alt="Analytics preview dashboard"
                    className="w-full rounded-2xl object-cover border border-sand-100/10"
                  />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-sand-100/5 rounded-xl p-3">
                      <div className="text-sand-400">Overall score</div>
                      <div className="text-2xl font-semibold text-sage-300">82</div>
                    </div>
                    <div className="bg-sand-100/5 rounded-xl p-3">
                      <div className="text-sand-400">Time to market</div>
                      <div className="text-2xl font-semibold text-sand-200">10 weeks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="absolute -bottom-10 -left-10 bg-[#111b36] border border-sand-100/10 rounded-2xl p-4 shadow-2xl float-fast">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-400/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-sage-300" />
                </div>
                <div className="text-sm">
                  <div className="text-sand-100 font-semibold">Report ready</div>
                  <div className="text-sand-400">PDF export in one click</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-8 right-6 bg-[#111b36] border border-sand-100/10 rounded-2xl px-4 py-3 shadow-2xl float-fast">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sand-200/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-sand-200" />
                </div>
                <div className="text-sm">
                  <div className="text-sand-100 font-semibold">Risk shield</div>
                  <div className="text-sand-400">Blind spots flagged</div>
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
              <h2 className="text-3xl sm:text-4xl font-semibold text-sand-100">A founder-friendly strategy workflow</h2>
              <p className="mt-4 text-sand-400 max-w-lg">
                Build momentum fast with a structured path from idea to actionable plan. Each section is
                designed to reduce ambiguity and accelerate your next move.
              </p>
            </div>
            <div className="lg:w-1/2 grid gap-6">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                <Card key={step.title} className="feature-card bg-sand-100/5 border border-sand-100/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-500/15 border border-sage-400/30">
                          <StepIcon className="h-5 w-5 text-sage-300" />
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-400">
                          Step {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-sand-100">{step.title}</h3>
                        <p className="text-sand-400 mt-2">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          </div>
        </div>
        </section>

        {/* Feature Highlights */}
        <section className="reveal py-24 bg-gradient-to-b from-[#0a122a] via-[#111b36] to-[#0a122a]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold text-sand-100">Deep intelligence, not generic advice</h2>
            <p className="mt-4 text-sand-400">
              Each report connects market data with your inputs to deliver a grounded plan you can trust.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {highlights.map((item) => (
              <Card key={item.title} className="feature-card bg-sand-100/5 border border-sand-100/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-500/15 border border-sage-400/30">
                      <item.icon className="h-6 w-6 text-sage-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-sand-100">{item.title}</h3>
                      <p className="mt-2 text-sand-400 text-sm">{item.description}</p>
                    </div>
                  </div>
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
            <h2 className="text-3xl sm:text-4xl font-semibold text-sand-100">Built for solo founders and fast teams</h2>
            <p className="mt-4 text-sand-400">
              Validate new ideas, explore pivots, and align your team with a shared strategy output.
            </p>
            <div className="mt-6 space-y-3">
              {['Shareable PDF reports', 'Community feedback loop', 'Team collaboration tools'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sand-300">
                  <CheckCircle2 className="h-4 w-4 text-sage-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-sage-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-sand-100/10 bg-sand-100/5 tilt-card">
              <img
                src="/@LofiMidnight24.jpg"
                alt="Founders collaborating on strategy"
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full border border-sand-100/20 bg-[#0a122a]/80 px-4 py-2 text-xs text-sand-200 backdrop-blur">
                <Users className="h-4 w-4 text-sage-300" />
                1.2k founders collaborating
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full border border-sand-100/20 bg-[#0a122a]/80 px-3 py-2 text-xs text-sand-200 backdrop-blur">
                <Sparkles className="h-4 w-4 text-sand-200" />
                24h turnaround
              </div>
            </div>
            <img
              src="/logo-main.png"
              alt="InceptIQ logo"
              className="w-40 h-40 rounded-3xl border border-sand-100/10 bg-sand-100/5 p-6 object-contain mt-8"
            />
            <div className="mt-8 grid gap-4">
              <Card className="bg-sand-100/5 border border-sand-100/10">
                <CardContent className="p-5">
                  <p className="text-sm text-sand-400">"We used the report to prep for our seed deck in 48 hours."</p>
                  <p className="mt-3 text-sm text-sand-100">- Ari, B2B SaaS founder</p>
                </CardContent>
              </Card>
              <Card className="bg-sand-100/5 border border-sand-100/10">
                <CardContent className="p-5">
                  <p className="text-sm text-sand-400">"It helped us spot a go-to-market gap before launch."</p>
                  <p className="mt-3 text-sm text-sand-100">- Miko, Marketplace builder</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </section>

        {/* Pricing */}
        <section className="reveal py-24 bg-[#0f1a33]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-sand-100">Simple, transparent pricing</h2>
          <p className="mt-4 text-sand-400">Start free today. Upgrade only when you need advanced insights.</p>
          <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-sand-100/5 border border-sand-100/10">
              <CardContent className="p-6">
                <div className="text-sm uppercase text-sand-400">Starter</div>
                <div className="text-3xl font-semibold mt-2 text-sand-100">Free</div>
                <p className="mt-3 text-sand-400">Perfect for exploring new ideas.</p>
                <ul className="mt-6 space-y-2 text-sm text-sand-300">
                  <li>1 analysis per day</li>
                  <li>Community publishing</li>
                  <li>PDF export</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-sage-500/20 to-sand-200/10 border border-sage-400/30">
              <CardContent className="p-6">
                <div className="text-sm uppercase text-sage-200">Growth</div>
                <div className="text-3xl font-semibold mt-2 text-sand-100">$29/mo</div>
                <p className="mt-3 text-sand-300">For teams running multiple validations.</p>
                <ul className="mt-6 space-y-2 text-sm text-sand-200">
                  <li>Unlimited analyses</li>
                  <li>Team collaboration</li>
                  <li>Priority AI queue</li>
                </ul>
                <div className="mt-6">
                  <Button className="bg-sand-200 text-ink-900 font-semibold px-4 py-2 rounded-full" asChild>
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
          <div className="relative overflow-hidden rounded-3xl border border-sand-100/10 bg-gradient-to-r from-sage-500/20 via-sand-200/10 to-sage-400/10 p-12">
            <div className="absolute inset-0 opacity-30">
              <svg width="100%" height="100%" viewBox="0 0 600 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 180C120 140 240 220 360 180C480 140 600 200 720 160" stroke="#E7DECD" strokeWidth="2" />
              </svg>
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-semibold text-sand-100">Ready to validate your next big move?</h2>
              <p className="mt-4 text-sand-300 max-w-xl">
                Start your analysis in minutes and turn your idea into a clear, actionable strategy.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button className="bg-sand-200 text-ink-900 font-semibold px-6 py-3 rounded-full" asChild>
                  <Link to={analysisCtaHref} className="flex items-center gap-2">
                    {finalCtaLabel}
                    <Rocket className="h-4 w-4" />
                  </Link>
                </Button>
                <Button className="bg-transparent border border-sand-200/40 text-sand-100 px-6 py-3 rounded-full" asChild>
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
            <h3 className="text-2xl font-semibold mb-6 text-sand-100">Your recent analyses</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {requests.map((r) => (
                <Card key={r.id} className="bg-sand-100/5 border border-sand-100/10">
                  <CardContent className="p-5">
                    <div className="text-xs text-sand-400">{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="text-lg font-semibold mt-2 text-sand-100">{r.input?.ideaTitle || 'Untitled'}</div>
                    <div className="text-sm text-sand-400 mt-2">
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
    </div>
  );
};

export default Home;
