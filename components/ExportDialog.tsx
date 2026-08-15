'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { exportExcel, exportPDF, exportWord } from '@/lib/exporters';

interface Props {
  results: AnalysisResult[];
  onClose: () => void;
}

type Format = 'excel' | 'pdf' | 'word';

const OPTIONS = [
  {
    id: 'excel' as Format,
    icon: '📊',
    label: 'Excel',
    desc: 'Two sheets — full report + urgent actions. Colour-coded by status.',
  },
  {
    id: 'word' as Format,
    icon: '📄',
    label: 'Word',
    desc: 'KPI summary, full table, and urgent actions. Ready to share or print.',
  },
  {
    id: 'pdf' as Format,
    icon: '📑',
    label: 'PDF',
    desc: 'Landscape A4, print-ready with tables, KPIs, and colour coding.',
  },
];

export default function ExportDialog({ results, onClose }: Props) {
  const [loading, setLoading] = useState<Format | null>(null);

  async function handleExport(format: Format) {
    setLoading(format);
    try {
      if (format === 'excel') await exportExcel(results);
      if (format === 'pdf')   await exportPDF(results);
      if (format === 'word')  await exportWord(results);
    } finally {
      setLoading(null);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[18px] font-extrabold text-slate-900">Download Report</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-3xl leading-none">&times;</button>
        </div>
        <p className="text-[13px] text-slate-400 mb-6">
          Choose your preferred format. Each version is fully formatted with colour-coded tables and an urgent actions summary.
        </p>

        <hr className="border-[#F1F5F9] mb-6" />

        {/* Format cards */}
        <div className="grid grid-cols-3 gap-4">
          {OPTIONS.map(opt => (
            <div key={opt.id} className="border border-[#E2E8F0] rounded-xl p-4 text-center flex flex-col">
              <div className="text-[32px] mb-2">{opt.icon}</div>
              <div className="text-[14px] font-bold text-slate-900 mb-1">{opt.label}</div>
              <p className="text-[11px] text-slate-400 leading-snug mb-4 flex-1">{opt.desc}</p>
              <button
                onClick={() => handleExport(opt.id)}
                disabled={loading !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg py-2 transition-colors"
              >
                {loading === opt.id ? 'Generating…' : `Download ${opt.label}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
