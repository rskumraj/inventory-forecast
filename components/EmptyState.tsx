export default function EmptyState() {
  return (
    <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-2xl py-20 px-10 text-center my-6">
      <span className="text-[52px] mb-5 block">📦</span>
      <div className="text-[22px] font-extrabold text-slate-900 tracking-tight mb-2.5">
        No Inventory Data Loaded
      </div>
      <div className="text-[14px] text-[#94A3B8] font-medium leading-[1.7] max-w-sm mx-auto">
        Upload a CSV file or enter your products manually above to generate your reorder recommendations.
      </div>
    </div>
  );
}
