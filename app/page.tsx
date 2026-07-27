'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Scale, ArrowRight, ShieldCheck, BrainCircuit, GitBranch,
  Zap, Eye, Lock, BarChart3, CheckCircle2, Star, TrendingUp,
  FileSearch, Users, Bell, Quote, FolderKanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const FEATURES = [
  { icon: BrainCircuit, title: 'AI Evidence Engine', desc: 'Automatically gathers, parses, and scores evidence using OCR and entity extraction.' },
  { icon: GitBranch, title: 'Explainable Decisions', desc: 'Every AI conclusion shows its source, reasoning chain, weight, and confidence.' },
  { icon: Scale, title: 'Fairness Scoring', desc: 'A transparent five-factor model evaluates completeness, consistency, corroboration, authenticity, and timeliness.' },
  { icon: Zap, title: 'Real-time Resolution', desc: 'Live dispute status, WebSocket notifications, and instant AI analysis keep cases moving.' },
  { icon: ShieldCheck, title: 'Audit-ready Trail', desc: 'Immutable audit logs capture every action for compliance and regulatory review.' },
  { icon: Eye, title: 'Full Transparency', desc: 'Card members and merchants both see how decisions are reached — no black boxes.' },
];

const TIMELINE = [
  { step: '01', title: 'Merchant creates transaction', desc: 'A purchase is processed and recorded in the ResolveAI ledger.' },
  { step: '02', title: 'Customer raises dispute', desc: 'The card member files a dispute through their issuing bank.' },
  { step: '03', title: 'System gathers evidence', desc: 'ResolveAI auto-collects transaction records, auth logs, and history.' },
  { step: '04', title: 'Merchant uploads evidence', desc: 'Invoices, tracking, emails, and receipts are submitted.' },
  { step: '05', title: 'AI extracts entities', desc: 'OCR pipeline pulls amounts, dates, tracking numbers, and parties.' },
  { step: '06', title: 'AI generates summary', desc: 'A structured summary of the dispute and evidence is produced.' },
  { step: '07', title: 'Fairness Engine scores', desc: 'Both parties are scored on the five-factor fairness model.' },
  { step: '08', title: 'Explainability generates reasoning', desc: 'A full reasoning chain with confidence is created.' },
  { step: '09', title: 'Decision produced', desc: 'Auto-resolved above 85% confidence, otherwise routed to a human.' },
  { step: '10', title: 'Appeal window opens', desc: 'Either party may file an appeal with new evidence.' },
  { step: '11', title: 'Investigator overrides if needed', desc: 'A human investigator reviews and can override the AI decision.' },
];

const METRICS = [
  { value: '92%', label: 'Auto-resolution rate', sub: 'for high-confidence cases' },
  { value: '4.2m', label: 'Average resolution time', sub: 'down from 14 days' },
  { value: '99.9%', label: 'Decision accuracy', sub: 'validated on appeals' },
  { value: '$24M', label: 'Disputes processed', sub: 'across 25 merchants' },
];

const TESTIMONIALS = [
  { quote: 'ResolveAI cut our chargeback handling time by 80%. The explainability layer finally gave our team and customers a shared understanding of every decision.', name: 'Rachel Kim', role: 'VP Risk, Apex Electronics', rating: 5 },
  { quote: 'The fairness engine is the real differentiator. Both sides see exactly how evidence was weighed. Appeals dropped dramatically.', name: 'David Osei', role: 'Head of Operations, CloudForge', rating: 5 },
  { quote: 'As an investigator, the AI reasoning chain saves me hours per case. I trust it because I can verify every step.', name: 'Elena Rossi', role: 'Senior Investigator, ResolveAI', rating: 5 },
];

const PRICING = [
  { name: 'Starter', price: '$499', period: '/mo', desc: 'For small merchants handling occasional disputes.', features: ['Up to 50 disputes/mo', 'AI evidence parsing', 'Standard support', '1 user seat'], cta: 'Start free trial', highlight: false },
  { name: 'Growth', price: '$1,999', period: '/mo', desc: 'For scaling teams with active chargeback programs.', features: ['Up to 500 disputes/mo', 'Full fairness engine', 'Explainability suite', 'Real-time notifications', '10 user seats', 'Priority support'], cta: 'Start free trial', highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For high-volume merchants and networks.', features: ['Unlimited disputes', 'Custom AI models', 'SSO & audit exports', 'Dedicated investigator', 'SLA guarantees', 'On-prem option'], cta: 'Contact sales', highlight: false },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">ResolveAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">Get started <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Trusted by 25 enterprise merchants
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Fair, explainable{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                dispute resolution
              </span>{' '}
              powered by AI.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              ResolveAI brings transparency to chargebacks. Every decision comes with a reasoning chain, evidence weights, and a fairness score — so card members and merchants both understand the outcome.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/login">Launch dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">See how it works</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border bg-card shadow-2xl shadow-blue-500/10 overflow-hidden">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground text-center">
                  app.resolveai.io/dashboard
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-6">
                {[
                  { l: 'Active Cases', v: '47', i: FolderKanban, c: 'text-blue-600' },
                  { l: 'Resolved Today', v: '23', i: CheckCircle2, c: 'text-emerald-600' },
                  { l: 'Fairness Score', v: '0.87', i: Scale, c: 'text-violet-600' },
                  { l: 'AI Confidence', v: '91%', i: BrainCircuit, c: 'text-cyan-600' },
                ].map((m) => {
                  const Icon = m.i;
                  return (
                    <div key={m.l} className="rounded-xl border bg-background p-4">
                      <Icon className={`h-5 w-5 ${m.c}`} />
                      <div className="mt-3 font-display text-2xl font-bold">{m.v}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.l}</div>
                    </div>
                  );
                })}
                <div className="col-span-4 rounded-xl border bg-background p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Disputes over time</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex h-24 items-end gap-1.5">
                    {[40, 55, 48, 62, 58, 70, 65, 78, 72, 85, 80, 92].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.8 + i * 0.04, duration: 0.4 }}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metrics */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border bg-card p-5 text-center"
              >
                <div className="font-display text-3xl font-bold tracking-tight">{m.value}</div>
                <div className="mt-1 text-sm font-medium">{m.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Everything you need to resolve disputes fairly.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              A complete platform built for transparency, speed, and trust.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-2xl border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              From transaction to resolution.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              An eleven-step pipeline that turns a chargeback into a fair, explainable decision.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <motion.div
                  key={t.step}
                  initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className={`relative flex items-center gap-6 ${i % 2 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-4 ring-background md:absolute md:left-1/2 md:-translate-x-1/2">
                    {i + 1}
                  </div>
                  <div className={`flex-1 ${i % 2 ? 'md:text-right' : ''}`}>
                    <div className={`rounded-xl border bg-card p-5 ${i % 2 ? 'md:mr-12' : 'md:ml-12'}`}>
                      <div className="text-xs font-mono text-primary font-semibold">{t.step}</div>
                      <h3 className="mt-1 font-display font-semibold">{t.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Trusted by risk teams worldwide.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border bg-card p-6"
              >
                <Quote className="h-7 w-7 text-primary/30" />
                <p className="mt-3 text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start with a free trial. Upgrade as your dispute volume grows.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border bg-card p-6 ${p.highlight ? 'ring-2 ring-primary shadow-xl shadow-primary/10' : ''}`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
                <Button className="mt-6 w-full" variant={p.highlight ? 'default' : 'outline'} asChild>
                  <Link href="/login">{p.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-slate-900 px-8 py-16 text-center text-white">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-balance">
                Ready to resolve disputes fairly?
              </h2>
              <p className="mt-4 text-blue-100/80 max-w-xl mx-auto">
                Join 25 enterprise merchants using ResolveAI to cut resolution time and build customer trust.
              </p>
              <Button size="lg" variant="secondary" asChild className="mt-8">
                <Link href="/login">Launch dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Scale className="h-5 w-5" />
                </div>
                <span className="font-display text-lg font-bold">ResolveAI</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Transparent, fair, explainable dispute resolution for the modern payments stack.
              </p>
            </div>
            {[
              { h: 'Product', links: ['Features', 'Pricing', 'AI Engine', 'Explainability', 'Security'] },
              { h: 'Company', links: ['About', 'Careers', 'Blog', 'Customers', 'Contact'] },
              { h: 'Resources', links: ['Documentation', 'API Reference', 'Compliance', 'Status', 'Changelog'] },
            ].map((col) => (
              <div key={col.h}>
                <h4 className="text-sm font-semibold">{col.h}</h4>
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8">
            <p className="text-xs text-muted-foreground">© 2024 ResolveAI Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> SOC 2 Type II</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> PCI DSS</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> GDPR</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
