'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { AnalysisResult } from '@/lib/types';

interface Props { results: AnalysisResult[]; safeLevel: number }

const STATUS_COLORS = { urgent: '#EF4444', warning: '#F59E0B', healthy: '#10B981' };
type Limit = 'Top 5' | 'Top 10' | 'All';

export default function StockChart({ results, safeLevel }: Props) {
  const [limit, setLimit] = useState<Limit>('Top 10');

  const data = (limit === 'Top 5' ? results.slice(0, 5) : limit === 'Top 10' ? results.slice(0, 10) : results)
    .map(r => ({ name: r.product, value: Math.round(r.daysRemaining), status: r.status }));

  return (
    <div className="mt-8">
      <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[1.2px] mb-3.5">
        Stock Health — Most Critical Products
      </div>

      <div className="flex gap-4">
        {/* Controls */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col gap-3 min-w-[120px]">
          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[1px] pb-1 border-b border-[#F1F5F9]">
            Display
          </div>
          {(['Top 5', 'Top 10', 'All'] as Limit[]).map(l => (
            <label key={l} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="chart-limit" checked={limit === l}
                onChange={() => setLimit(l)}
                className="accent-blue-500"
              />
              <span className="text-[12px] font-medium text-slate-600">{l}</span>
            </label>
          ))}

          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[1px] pb-1 border-b border-[#F1F5F9] mt-2">
            Legend
          </div>
          {[
            { color: '#EF4444', label: 'Urgent' },
            { color: '#F59E0B', label: 'Warning' },
            { color: '#10B981', label: 'Healthy' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-[12px] text-slate-500 font-medium">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-[2px] flex-shrink-0 border-t-2 border-dashed border-slate-400" />
            <span className="text-[12px] text-slate-500 font-medium">Min Safe</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex-1 min-w-0">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 8, right: 120, left: 0, bottom: 60 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 0" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Days of Stock Remaining', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94A3B8', dx: -4 }}
              />
              <Tooltip
                formatter={(val: number) => [`${val} days`, 'Stock remaining']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
              />
              <ReferenceLine
                y={safeLevel}
                stroke="#64748B"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: `Min Safe (${safeLevel}d)`, position: 'right', fontSize: 11, fill: '#64748B' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
