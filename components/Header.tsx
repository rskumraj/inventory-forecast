export default function Header() {
  return (
    <header className="bg-[#0D1B2E] px-8 py-[18px] flex items-center justify-between border-b border-[#1E2D40] flex-shrink-0">
      <div>
        <div className="text-white text-[20px] font-extrabold tracking-tight leading-none">
          inventory<span className="text-blue-400">.</span>ai
        </div>
        <div className="text-[12px] text-[#64748B] mt-[3px] font-normal tracking-[0.2px]">
          Know what is about to happen before it does
        </div>
      </div>
      <div className="bg-[#1E2D40] border border-[#2D3F55] text-[#94A3B8] text-[11px] font-semibold px-[14px] py-[6px] rounded-full tracking-[0.5px] flex items-center gap-2">
        <span className="inline-block w-[7px] h-[7px] bg-green-400 rounded-full" />
        Forecast-Driven
      </div>
    </header>
  );
}
