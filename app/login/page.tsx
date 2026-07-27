'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Building2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';

const ROLES: { key: UserRole; label: string; desc: string }[] = [
  { key: 'admin', label: 'Administrator', desc: 'Full platform control' },
  { key: 'investigator', label: 'Investigator', desc: 'Review and decide cases' },
  { key: 'merchant', label: 'Merchant', desc: 'Submit evidence, track cases' },
  { key: 'cardmember', label: 'Card Member', desc: 'File and follow disputes' },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('investigator');
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(selectedRole);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">ResolveAI</span>
          </div>
          <div className="space-y-6 max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl font-bold leading-tight text-balance"
            >
              Fair, explainable dispute resolution powered by AI.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-blue-100/80 text-lg"
            >
              Resolve chargebacks in minutes with transparent evidence scoring, AI reasoning, and a real-time audit trail trusted by enterprises worldwide.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 gap-4 pt-4"
            >
              {[
                { v: '92%', l: 'Auto-resolve rate' },
                { v: '4.2m', l: 'Avg. resolution' },
                { v: '99.9%', l: 'Decision accuracy' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold">{s.v}</div>
                  <div className="text-xs text-blue-100/70 mt-1">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="text-xs text-blue-100/60">
            SOC 2 Type II · PCI DSS · GDPR Compliant
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span className="font-display font-bold">ResolveAI</span>
          </div>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-6"
          >
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Reset your password'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'signin'
                  ? 'Sign in to your ResolveAI workspace.'
                  : 'Enter your email and we\'ll send a reset link.'}
              </p>
            </div>

            {mode === 'signin' ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email" type="email" placeholder="you@company.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="pl-9" required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button type="button" onClick={() => setMode('forgot')}
                        className="text-xs text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="pl-9" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Quick access role</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((r) => (
                        <button key={r.key} type="button"
                          onClick={() => setSelectedRole(r.key)}
                          className={`text-left rounded-lg border p-3 transition-all ${
                            selectedRole === r.key
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-border hover:border-primary/40'
                          }`}>
                          <div className="text-sm font-medium">{r.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" size="lg" onClick={handleSubmit}>
                  <Building2 className="mr-2 h-4 w-4" /> Continue with Google
                </Button>
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Protected by 256-bit encryption
                </p>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setMode('signin'); }}
                className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="you@company.com" required />
                </div>
                <Button type="submit" className="w-full" size="lg">Send reset link</Button>
                <button type="button" onClick={() => setMode('signin')}
                  className="block w-full text-center text-sm text-primary hover:underline">
                  Back to sign in
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
