'use client';

import { useState } from 'react';
import type { Settings, FilterOption, AnalysisResult } from '@/lib/types';
import ExportDialog from './ExportDialog';

interface Props {
  settings: Settings;
  onSettingsChange: (s: Settings) => void;
  filter: FilterOption;
  onFilterChange: (f: FilterOption) => void;
  hasResults: boolean;
  results: AnalysisResult[];
}

function NumInput({
  label, value, min = 0, onChange,
}: { label: string; value: number; min?: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.4px] mb-1">
        {label}
      </label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-[#1E2D40] border border-[#2D3F55] text-[#F1F5F9] rounded-lg px-3 py-2 text-[14px] font-semibold outline-none focus:border-blue-500"
      />
    </div>
  );
}

export default function Sidebar({ settings, onSettingsChange, filter, onFilterChange, hasResults, results }: Props) {
  const [open, setOpen] = useState(true);
  const [showExport, setShowExport] = useState(false);

  function handleSetting(key: keyof Settings, val: number) {
    onSettingsChange({ ...settings, [key]: val });
  }

  return (
    <div className="relative flex flex-shrink-0" style={{ transition: 'width 0.3s ease', width: open ? 280 : 0 }}>
      {/* Sidebar panel */}
      <div
        className="bg-[#0D1B2E] h-full flex flex-col overflow-hidden"
        style={{ width: 280, minWidth: 280, transition: 'transform 0.3s ease', transform: open ? 'translateX(0)' : 'translateX(-280px)' }}
      >
        {/* Logo */}
        <div className="px-5 py-[22px] border-b border-[#1E2D40]">
          <div className="text-white text-[17px] font-extrabold tracking-tight">
            inventory<span className="text-blue-400">.</span>ai
          </div>
          <div className="text-[11px] text-[#475569] mt-[2px]">Inventory Intelligence System</div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {/* Inventory Settings */}
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-[1.1px] pt-4 pb-2 border-t border-[#1E2D40]">
            Inventory Settings
          </div>
          <NumInput label="Lead Time (days)"      value={settings.leadTime}   min={1} onChange={v => handleSetting('leadTime', v)} />
          <NumInput label="Safety Buffer (days)"  value={settings.safetyDays} min={0} onChange={v => handleSetting('safetyDays', v)} />
          <NumInput label="Reorder Cycle (days)"  value={settings.cycleDays}  min={1} onChange={v => handleSetting('cycleDays', v)} />

          {/* Filter View */}
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-[1.1px] pt-4 pb-2 border-t border-[#1E2D40] mt-2">
            Filter View
          </div>
          <select
            value={filter}
            onChange={e => onFilterChange(e.target.value as FilterOption)}
            className="w-full bg-[#1E2D40] border border-[#2D3F55] text-[#F1F5F9] rounded-lg px-3 py-2 text-[13px] font-medium outline-none focus:border-blue-500"
          >
            <option value="all">All products</option>
            <option value="urgent">Urgent only</option>
            <option value="warning">Warning only</option>
            <option value="healthy">Healthy only</option>
          </select>

          {/* Export */}
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-[1.1px] pt-4 pb-2 border-t border-[#1E2D40] mt-4">
            Export
          </div>
          <button
            onClick={() => setShowExport(true)}
            disabled={!hasResults}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[10px] py-[10px] transition-colors"
          >
            ⬇ Download Report
          </button>
        </div>
      </div>

      {/* Export dialog */}
      {showExport && (
        <ExportDialog results={results} onClose={() => setShowExport(false)} />
      )}

      {/* Collapse / expand toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-[22px] h-[56px] bg-[#1E2D40] border border-[#2D3F55] border-l-0 rounded-r-[10px] text-[#94A3B8] text-[16px] cursor-pointer hover:bg-[#2D3F55] transition-colors"
        style={{ left: open ? 280 : 0 }}
        title={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {open ? '‹' : '›'}
      </button>
    </div>
  );
}
