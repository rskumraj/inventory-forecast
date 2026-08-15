import type { AnalysisResult } from '@/lib/types';

interface Props { results: AnalysisResult[] }

function Card({
  label, value, sub, barColor, valueColor,
}: { label: string; value: string | number; sub: string; barColor: string; valueColor?: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm animate-fade-up flex-1 min-w-0">
      <div className="h-[3px]" style={{ background: barColor }} />
      <div className="px-[22px] py-5">
        <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.9px] mb-2.5">{label}</div>
        <div className="text-[40px] font-extrabold leading-none tracking-[-2px]" style={{ color: valueColor ?? '#0F172A' }}>
          {value}
        </div>
        <div className="text-[12px] text-[#94A3B8] mt-1.5 font-medium">{sub}</div>
      </div>
    </div>
  );
}

export default function MetricCards({ results }: Props) {
  const urgent  = results.filter(r => r.status === 'urgent').length;
  const warning = results.filter(r => r.status === 'warning').length;
  const healthy = results.filter(r => r.status === 'healthy').length;
  const total   = results.length;
  const pct     = total > 0 ? Math.round((healthy / total) * 100) : 0;

  const healthBar = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
  const healthVal = pct >= 70 ? '#059669' : pct >= 40 ? '#D97706' : '#DC2626';

  return (
    <div className="flex gap-3 mb-7">
      <Card label="Total Products"  value={total}   sub="being monitored"     barColor="#3B82F6" />
      <Card label="Urgent"          value={urgent}  sub="act today"           barColor={urgent  > 0 ? '#EF4444' : '#10B981'} valueColor={urgent  > 0 ? '#DC2626' : '#059669'} />
      <Card label="Warning"         value={warning} sub="act this week"       barColor={warning > 0 ? '#F59E0B' : '#10B981'} valueColor={warning > 0 ? '#D97706' : '#059669'} />
      <Card label="Healthy"         value={healthy} sub="no action needed"    barColor="#10B981" valueColor="#059669" />
      <Card label="Portfolio Health" value={`${pct}%`} sub="products in good shape" barColor={healthBar} valueColor={healthVal} />
    </div>
  );
}
