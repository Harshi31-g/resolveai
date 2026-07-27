'use client';

import { motion } from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar,
  RadarChart, PolarAngleAxis, PolarGrid,
} from 'recharts';
import { Clock, TrendingUp, Scale, Users, Target, Activity, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard, PageHeader } from '@/components/shared';
import { getDataset } from '@/lib/mock-data';

export default function AnalyticsPage() {
  const ds = getDataset();
  const decided = ds.disputes.filter((d) => d.decision);
  const appealRate = (ds.disputes.filter((d) => d.appeal).length / ds.disputes.length * 100).toFixed(1);
  const merchantSatisfaction = 87; const customerSatisfaction = 82; const decisionAccuracy = 94;

  const resolutionTrend = Array.from({ length: 12 }).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    resolution: parseFloat((3 + Math.sin(i / 2) * 1.2 + Math.random()).toFixed(1)),
    appeal: parseFloat((12 + Math.cos(i / 3) * 4 + Math.random() * 2).toFixed(1)),
  }));

  const fairnessTrend = Array.from({ length: 12 }).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    fairness: parseFloat((0.75 + i * 0.012 + Math.random() * 0.04).toFixed(2)),
    accuracy: parseFloat((0.88 + i * 0.006 + Math.random() * 0.03).toFixed(2)),
  }));

  const merchantPerf = ds.merchants.slice(0, 8).map((m) => ({
    name: m.name.split(' ')[0],
    winRate: m.winRate,
    disputes: m.totalDisputes,
  }));

  const radarData = [
    { metric: 'Completeness', value: 0.88 },
    { metric: 'Consistency', value: 0.82 },
    { metric: 'Corroboration', value: 0.79 },
    { metric: 'Authenticity', value: 0.91 },
    { metric: 'Timeliness', value: 0.74 },
  ];

  const satisfactionPie = [
    { name: 'Very Satisfied', value: 58, color: 'hsl(142 71% 45%)' },
    { name: 'Satisfied', value: 27, color: 'hsl(217 91% 60%)' },
    { name: 'Neutral', value: 10, color: 'hsl(38 92% 50%)' },
    { name: 'Dissatisfied', value: 5, color: 'hsl(340 75% 55%)' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Analytics"
        description="Executive insights across dispute resolution performance"
        actions={<Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export report</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label="Resolution Time" value="4.2h" icon={Clock} color="text-blue-600" delay={0} trend={{ value: '18%', positive: true }} />
        <MetricCard label="Appeal Rate" value={`${appealRate}%`} icon={Activity} color="text-amber-600" delay={0.05} trend={{ value: '6%', positive: true }} />
        <MetricCard label="Merchant CSAT" value={`${merchantSatisfaction}%`} icon={Users} color="text-emerald-600" delay={0.1} trend={{ value: '3%', positive: true }} />
        <MetricCard label="Customer CSAT" value={`${customerSatisfaction}%`} icon={Users} color="text-violet-600" delay={0.15} trend={{ value: '4%', positive: true }} />
        <MetricCard label="Decision Accuracy" value={`${decisionAccuracy}%`} icon={Target} color="text-cyan-600" delay={0.2} trend={{ value: '2%', positive: true }} />
        <MetricCard label="Fairness Trend" value="0.87" icon={Scale} color="text-indigo-600" delay={0.25} trend={{ value: '5%', positive: true }} />
      </div>

      {/* Resolution time + appeal rate trend */}
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader><CardTitle>Resolution Time vs. Appeal Rate</CardTitle><CardDescription>Last 12 months</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={resolutionTrend} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="resolution" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} name="Resolution (h)" />
                <Line type="monotone" dataKey="appeal" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ r: 3 }} name="Appeal rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fairness & Accuracy Trend</CardTitle><CardDescription>Model performance over time</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={fairnessTrend} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="gFair" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gAcc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0.6, 1]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="fairness" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#gFair)" name="Fairness" />
                <Area type="monotone" dataKey="accuracy" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#gAcc)" name="Accuracy" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Merchant performance + radar */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader><CardTitle>Merchant Performance</CardTitle><CardDescription>Win rate and dispute volume</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={merchantPerf} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="winRate" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} name="Win rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fairness Engine Radar</CardTitle><CardDescription>Average scores by factor</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Radar dataKey="value" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60%)" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction breakdown */}
      <Card className="mt-4">
        <CardHeader><CardTitle>Customer Satisfaction Distribution</CardTitle><CardDescription>Post-resolution survey results</CardDescription></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={satisfactionPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {satisfactionPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {satisfactionPie.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1">{d.name}</span>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
