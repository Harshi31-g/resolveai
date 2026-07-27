'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Scale, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { UserRole } from '@/lib/types';

const ROLES: { key: UserRole; label: string }[] = [
  { key: 'admin', label: 'Administrator' },
  { key: 'investigator', label: 'Investigator' },
  { key: 'merchant', label: 'Merchant' },
  { key: 'cardmember', label: 'Card Member' },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('investigator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) { setError(err); return; }
      router.push('/dashboard');
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName || email.split('@')[0], role);
      setLoading(false);
      if (err) { setError(err); return; }
      router.push('/dashboard');
    }
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
              Resolve chargebacks in minutes with transparent evidence scoring, AI reasoning, and a real-time audit trail.
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
          <div className="text-xs text-blue-100/60">SOC 2 Type II · PCI DSS · GDPR Compliant</div>
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
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'signin'
                  ? 'Sign in to your ResolveAI workspace.'
                  : 'Sign up to start resolving disputes with AI.'}
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name" placeholder="Alex Morgan"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password" type="password" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-9" required minLength={6}
                  />
                </div>
              </div>
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                className="text-primary font-medium hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
