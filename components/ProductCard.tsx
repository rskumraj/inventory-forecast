import type { AnalysisResult } from '@/lib/types';
import clsx from 'clsx';

interface Props { result: AnalysisResult; defaultLeadTime: number }

const STATUS_COLORS = {
  urgent:  { border: 'border-l-[#EF4444]', badge: 'bg-[#FEE2E2] text-[#DC2626]', bar: '#EF4444', pill: 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]', label: '● Urgent',    headlineColor: 'text-[#DC2626]', chipBg: 'bg-[#FEE2E2] text-[#991B1B]' },
  warning: { border: 'border-l-[#F59E0B]', badge: 'bg-[#FEF3C7] text-[#D97706]', bar: '#F59E0B', pill: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]', label: '● This Week', headlineColor: 'text-[#D97706]', chipBg: 'bg-[#FEF3C7] text-[#92400E]' },
  healthy: { border: 'border-l-[#10B981]', badge: 'bg-[#D1FAE5] text-[#059669]', bar: '#10B981', pill: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]', label: '● Healthy',   headlineColor: 'text-[#059669]', chipBg: 'bg-[#D1FAE5] text-[#065F46]' },
};

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-[10px] py-[4px] rounded-[6px] text-[11px] font-semibold tracking-[0.3px] whitespace-nowrap ${color}`}>
      {text}
    </span>
  );
}

export default function ProductCard({ result, defaultLeadTime }: Props) {
  const s = STATUS_COLORS[result.status];
  const barPct = Math.min(100, Math.max(0, (result.daysRemaining / 90) * 100));
  const lead = result.leadTimeDays || defaultLeadTime;

  let headline: string;
  let chips: { text: string; color: string }[];

  const sourceChip = result.dataSource === 'real'
    ? { text: 'REAL DATA',  color: 'bg-[#DBEAFE] text-[#1D4ED8]' }
    : { text: 'SIMULATED',  color: 'bg-[#F1F5F9] text-[#475569]' };

  if (result.status === 'urgent') {
    const overdue = Math.abs(result.daysUntilReorder);
    headline = `INITIATE PURCHASE ORDER — STOCKOUT IN ${result.daysRemaining.toFixed(0)} DAYS`;
    chips = [
      { text: `ROP BREACHED ${overdue.toFixed(0)}D AGO`,     color: 'bg-[#FEE2E2] text-[#991B1B]' },
      { text: `PO QTY: ${result.reorderQty.toFixed(0)} UNITS`, color: 'bg-[#FEE2E2] text-[#991B1B]' },
      { text: `VELOCITY: ${result.avgForecast.toFixed(1)}/DAY`, color: 'bg-[#F1F5F9] text-[#475569]' },
      { text: `TREND: ${result.trendLabel.toUpperCase()} ${result.trendEmoji}`, color: 'bg-[#F1F5F9] text-[#475569]' },
      sourceChip,
    ];
  } else if (result.status === 'warning') {
    headline = `ISSUE PO WITHIN ${result.daysUntilReorder.toFixed(0)} DAYS — ROP BREACH IMMINENT`;
    chips = [
      { text: `PROCUREMENT WINDOW: ${result.daysUntilReorder.toFixed(0)}D`, color: 'bg-[#FEF3C7] text-[#92400E]' },
      { text: `PO QTY: ${result.reorderQty.toFixed(0)} UNITS`, color: 'bg-[#FEF3C7] text-[#92400E]' },
      { text: `VELOCITY: ${result.avgForecast.toFixed(1)}/DAY`, color: 'bg-[#F1F5F9] text-[#475569]' },
      { text: `TREND: ${result.trendLabel.toUpperCase()} ${result.trendEmoji}`, color: 'bg-[#F1F5F9] text-[#475569]' },
      sourceChip,
    ];
  } else {
    headline = `COVERAGE NOMINAL — REPLENISHMENT TRIGGER IN ${result.daysUntilReorder.toFixed(0)} DAYS`;
    chips = [
      { text: `STOCK COVERAGE: ${result.wos.toFixed(1)}WOS`, color: 'bg-[#D1FAE5] text-[#065F46]' },
      { text: `NEXT PO: ${result.reorderQty.toFixed(0)} UNITS`, color: 'bg-[#D1FAE5] text-[#065F46]' },
      { text: (result.peakDate && result.peakDate !== 'N/A') ? `PEAK DEMAND: ${result.peakDate}` : 'PEAK DEMAND: UPLOAD SALES HISTORY', color: 'bg-[#F1F5F9] text-[#475569]' },
      { text: `VELOCITY: ${result.avgForecast.toFixed(1)}/DAY`, color: 'bg-[#F1F5F9] text-[#475569]' },
      sourceChip,
    ];
  }

  return (
    <div className={clsx(
      'bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 mb-2.5 shadow-sm animate-fade-up',
      'border-l-4', s.border,
    )}>
      <div className="flex justify-between items-start gap-5">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <span className={clsx('inline-block px-[10px] py-[3px] rounded-full text-[11px] font-bold tracking-[0.3px] mb-2', s.badge)}>
            {s.label}
          </span>
          <div className="text-[15px] font-bold text-slate-900 mb-[3px]">{result.product}</div>
          <div className="text-[12px] text-[#94A3B8] font-medium">
            {result.currentStock} units in stock
            &nbsp;·&nbsp;{result.avgDailySales.toFixed(1)} units/day
            &nbsp;·&nbsp;{lead.toFixed(0)}d lead time
          </div>

          {/* Stock bar */}
          <div className="flex justify-between text-[11px] text-[#94A3B8] font-medium mt-2.5 mb-1">
            <span>Stock level</span>
            <span>{result.daysRemaining.toFixed(0)} days remaining</span>
          </div>
          <div className="bg-[#F1F5F9] rounded-full h-[5px] overflow-hidden mb-2.5">
            <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: s.bar }} />
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-[#F1F5F9]">
            <div className={clsx('text-[11px] font-extrabold tracking-[0.7px] mb-2', s.headlineColor)}>
              {headline}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c, i) => <Chip key={i} text={c.text} color={c.color} />)}
            </div>
          </div>
        </div>

        {/* Right pills */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className={clsx('text-center rounded-[10px] px-[14px] py-[10px] border min-w-[80px]', s.pill)}>
            <div className="text-[22px] font-extrabold leading-none tracking-[-1px]">
              {result.daysRemaining.toFixed(0)}
            </div>
            <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.5px] mt-[3px]">
              days left
            </div>
          </div>
          <div className="text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-[14px] py-[10px] min-w-[80px]">
            <div className="text-[22px] font-extrabold leading-none tracking-[-1px] text-slate-900">
              {result.reorderQty.toFixed(0)}
            </div>
            <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.5px] mt-[3px]">
              units to order
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
