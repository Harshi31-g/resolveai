'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ConfidenceGauge({ value, label, size = 120 }: { value: number; label?: string; size?: number }) {
  const pct = Math.round(value * 100);
  const color = value > 0.85 ? 'hsl(142 71% 45%)' : value >= 0.6 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)';
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  const offset = circ - value * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={8} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={8}
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground mt-2">{label}</span>}
    </div>
  );
}

export function ScoreBar({ label, value, color }: { label: string; value: number; color?: string }) {
  const pct = Math.round(value * 100);
  const c = color || (value > 0.8 ? 'bg-success' : value >= 0.6 ? 'bg-warning' : 'bg-destructive');
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', c)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
