const TERMS = [
  { badge: 'ROP',          def: 'Reorder Point — The stock level that triggers a new supplier order' },
  { badge: 'PO',           def: 'Purchase Order — A formal order placed with your supplier' },
  { badge: 'WOS',          def: 'Weeks Of Supply — How many weeks of stock you currently have left' },
  { badge: 'VELOCITY',     def: 'Demand Velocity — Average units sold per day based on forecast' },
  { badge: 'LEAD TIME',    def: 'Lead Time — Days from placing an order to receiving the stock' },
  { badge: 'PROC. WINDOW', def: 'Procurement Window — Days remaining to order before stockout risk begins' },
];

export default function TerminologyLegend() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 shadow-sm mt-6 animate-fade-up">
      <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[1px] mb-3.5 pb-3 border-b border-[#F1F5F9]">
        Terminology Guide
      </div>
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        {TERMS.map(({ badge, def }) => (
          <div key={badge} className="flex items-start gap-3">
            <span className="bg-[#F1F5F9] text-slate-900 text-[10px] font-extrabold tracking-[0.5px] px-0 py-1 rounded-[6px] flex-shrink-0 w-[110px] text-center mt-[1px]">
              {badge}
            </span>
            <span className="text-[12px] font-medium text-[#64748B] leading-[1.5]">{def}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
