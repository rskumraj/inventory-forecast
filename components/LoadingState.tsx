export default function LoadingState() {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] py-16 px-10 text-center my-6"
      style={{ background: 'linear-gradient(160deg,#0D1B2E 0%,#1B3A6B 100%)' }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)',
      }} />

      <div className="text-[22px] font-extrabold text-white mb-1.5 tracking-tight animate-fade-up">
        Analysing Your Supply Chain
      </div>
      <div className="text-[13px] text-[#94A3B8] mb-11 leading-relaxed animate-fade-up">
        Calculating Reorder Windows&nbsp;·&nbsp;Ranking Urgency&nbsp;·&nbsp;Generating Recommendations
      </div>

      {/* Supply chain pipeline */}
      <div className="flex items-center justify-center gap-0 mb-11 animate-fade-up">
        {[
          { icon: '🏭', label: 'Supplier',  cls: 'bg-blue-500/20 border-blue-500/40',  delay: '0s' },
          { connector: true, dot: 'bg-blue-400', dotDelay: '0s' },
          { icon: '📦', label: 'Warehouse', cls: 'bg-purple-500/20 border-purple-500/40', delay: '0.3s' },
          { connector: true, dot: 'bg-purple-400', dotDelay: '0.6s' },
          { icon: '🚚', label: 'In Transit', cls: 'bg-emerald-500/20 border-emerald-500/40', delay: '0.6s' },
          { connector: true, dot: 'bg-emerald-400', dotDelay: '1.2s' },
          { icon: '🛍️', label: 'Store',      cls: 'bg-amber-500/20 border-amber-500/40', delay: '0.9s' },
        ].map((item, i) => {
          if ('connector' in item) {
            return (
              <div key={i} className="relative w-16 h-[2px] bg-white/10 mx-1 mb-6 overflow-visible">
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-flow-dot"
                  style={{ background: item.dot, animationDelay: item.dotDelay }}
                />
              </div>
            );
          }
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className={`w-14 h-14 rounded-[14px] flex items-center justify-center text-2xl border animate-pulse-icon ${item.cls}`}
                style={{ animationDelay: item.delay }}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.6px]">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-1/2 mx-auto rounded-full overflow-hidden bg-white/10 animate-fade-up">
        <div className="h-full rounded-full animate-shimmer" />
      </div>
    </div>
  );
}
