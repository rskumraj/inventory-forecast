'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import type { Product, HistoryRow } from '@/lib/types';

interface Props {
  onDataReady: (products: Product[], history: HistoryRow[]) => void;
  defaultLeadTime: number;
}

type Tab = 'csv' | 'manual' | 'history';

/* ── helpers ── */
// Trim + lowercase a header so "Lead Time (Days)", " lead time (days)", etc. all match the same column.
const normalizeHeader = (h: string) => h.trim().toLowerCase();

function parseInventoryCSV(text: string, defaultLead: number): { products: Product[]; errors: string[]; notices: string[] } {
  const { data, errors: parseErrors } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const products: Product[] = [];
  const errors: string[] = [];
  const notices: string[] = [];

  // Map normalized header -> raw header actually present in the file, so lookups are case/whitespace-insensitive.
  const rawHeaders = Object.keys(data[0] ?? {});
  const headerMap = new Map<string, string>();
  for (const h of rawHeaders) headerMap.set(normalizeHeader(h), h);

  const required = ['Product', 'Current Stock', 'Avg Daily Sales'];
  const missing = required.filter(c => !headerMap.has(normalizeHeader(c)));
  if (missing.length) { errors.push(`Missing columns: ${missing.join(', ')}`); return { products, errors, notices }; }

  const productKey = headerMap.get(normalizeHeader('Product'))!;
  const stockKey   = headerMap.get(normalizeHeader('Current Stock'))!;
  const salesKey   = headerMap.get(normalizeHeader('Avg Daily Sales'))!;
  const leadKey    = headerMap.get(normalizeHeader('Lead Time (days)'));

  if (!leadKey) {
    notices.push(`Lead Time (Days) column not found — using default (${defaultLead}d) for all products`);
  }

  for (const row of data) {
    if (!row[productKey]?.trim()) continue;
    products.push({
      product:       row[productKey].trim(),
      currentStock:  parseFloat(row[stockKey]) || 0,
      avgDailySales: parseFloat(row[salesKey]) || 0,
      leadTimeDays:  leadKey ? (parseFloat(row[leadKey]) || defaultLead) : defaultLead,
    });
  }
  return { products, errors, notices };
}

function parseHistoryCSV(text: string): { rows: HistoryRow[]; errors: string[] } {
  const { data } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const errors: string[] = [];

  // Map normalized header -> raw header actually present in the file, so lookups are case/whitespace-insensitive.
  const rawHeaders = Object.keys(data[0] ?? {});
  const headerMap = new Map<string, string>();
  for (const h of rawHeaders) headerMap.set(normalizeHeader(h), h);

  const required = ['Product', 'Date', 'Units Sold'];
  const missing = required.filter(c => !headerMap.has(normalizeHeader(c)));
  if (missing.length) { errors.push(`Missing columns: ${missing.join(', ')}`); return { rows: [], errors }; }

  const productKey = headerMap.get(normalizeHeader('Product'))!;
  const dateKey    = headerMap.get(normalizeHeader('Date'))!;
  const unitsKey   = headerMap.get(normalizeHeader('Units Sold'))!;

  const rows: HistoryRow[] = data.map(r => ({
    product:    r[productKey]?.trim() ?? '',
    date:       r[dateKey]?.trim() ?? '',
    unitsSold:  parseFloat(r[unitsKey]) || 0,
  })).filter(r => r.product && r.date);
  return { rows, errors };
}

/* ── Upload Zone ── */
function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-white to-[#EFF6FF] rounded-[28px] flex flex-col items-center justify-center py-12 px-8 cursor-pointer hover:border-blue-400 hover:bg-[#EFF6FF] transition-all group"
      onClick={() => inputRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onFiles(Array.from(e.dataTransfer.files)); }}
    >
      <span className="text-6xl mb-4 animate-cloud block">☁️</span>
      <span className="text-[14px] font-bold text-blue-700">Drop files here or click to browse</span>
      <span className="text-[11px] text-slate-400 mt-1">CSV files only</span>
      <input ref={inputRef} type="file" accept=".csv" multiple className="hidden"
        onChange={e => { if (e.target.files) onFiles(Array.from(e.target.files)); }} />
    </div>
  );
}

/* ── Loaded card ── */
function LoadedCard({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm mb-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-[#DCFCE7] rounded-xl flex items-center justify-center text-[22px]">✅</div>
        <span className="text-[13px] font-semibold text-slate-800">{label}</span>
      </div>
      <button onClick={onClear} className="text-[12px] text-slate-400 hover:text-slate-600 font-medium transition-colors">
        ↩ Clear
      </button>
    </div>
  );
}

/* ── Manual row ── */
const EMPTY_ROW = (): Product => ({ product: '', currentStock: 0, avgDailySales: 0, leadTimeDays: 14 });

function ManualTable({
  rows, onChange,
}: { rows: Product[]; onChange: (rows: Product[]) => void }) {
  function update<K extends keyof Product>(i: number, field: K, val: Product[K]) {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  }
  function addRow()    { onChange([...rows, EMPTY_ROW()]); }
  function removeRow(i: number) { onChange(rows.filter((_, idx) => idx !== i)); }

  const th = 'text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.8px] text-left py-2 px-3';
  const td = 'py-1.5 px-2';
  const inp = 'w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-800 outline-none focus:border-blue-400';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#F1F5F9]">
            <th className={th}>Product Name</th>
            <th className={th}>Current Stock</th>
            <th className={th}>Avg Daily Sales</th>
            <th className={th}>Lead Time (days)</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#F8FAFC]">
              <td className={td}><input className={inp} value={row.product}       onChange={e => update(i, 'product', e.target.value)} placeholder="Product name" /></td>
              <td className={td}><input className={`${inp} w-28`} type="number" min={0} value={row.currentStock}  onChange={e => update(i, 'currentStock', Number(e.target.value))} /></td>
              <td className={td}><input className={`${inp} w-28`} type="number" min={0} step={0.1} value={row.avgDailySales} onChange={e => update(i, 'avgDailySales', Number(e.target.value))} /></td>
              <td className={td}><input className={`${inp} w-24`} type="number" min={1} value={row.leadTimeDays}  onChange={e => update(i, 'leadTimeDays', Number(e.target.value))} /></td>
              <td className={td}><button onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="mt-3 text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
        + Add row
      </button>
    </div>
  );
}

/* ── Main component ── */
export default function DataInput({ onDataReady, defaultLeadTime }: Props) {
  const [tab, setTab] = useState<Tab>('csv');

  /* CSV tab */
  const [csvProducts, setCsvProducts]         = useState<Product[] | null>(null);
  const [csvFileLabel, setCsvFileLabel]        = useState('');
  const [csvErrors, setCsvErrors]             = useState<string[]>([]);
  const [csvNotices, setCsvNotices]           = useState<string[]>([]);

  /* History tab */
  const [historyRows, setHistoryRows]         = useState<HistoryRow[]>([]);
  const [historyLabel, setHistoryLabel]       = useState('');
  const [historyErrors, setHistoryErrors]     = useState<string[]>([]);

  /* Manual tab */
  const [manualRows, setManualRows]           = useState<Product[]>([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [manualSubmitted, setManualSubmitted] = useState(false);

  function handleCSVFiles(files: File[]) {
    const allProducts: Product[] = [];
    const allErrors: string[] = [];
    const allNotices: string[] = [];
    let processed = 0;
    for (const f of files) {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result as string;
        const { products, errors, notices } = parseInventoryCSV(text, defaultLeadTime);
        allProducts.push(...products);
        allErrors.push(...errors.map(err => `${f.name}: ${err}`));
        allNotices.push(...notices.map(n => `${f.name}: ${n}`));
        processed++;
        if (processed === files.length) {
          setCsvErrors(allErrors);
          setCsvNotices(allNotices);
          if (allProducts.length) {
            setCsvProducts(allProducts);
            setCsvFileLabel(`${allProducts.length} products loaded from ${files.map(f => f.name).join(', ')}`);
            onDataReady(allProducts, historyRows);
          }
        }
      };
      reader.readAsText(f);
    }
  }

  function handleHistoryFiles(files: File[]) {
    const allRows: HistoryRow[] = [];
    const allErrors: string[] = [];
    let processed = 0;
    for (const f of files) {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result as string;
        const { rows, errors } = parseHistoryCSV(text);
        allRows.push(...rows);
        allErrors.push(...errors.map(err => `${f.name}: ${err}`));
        processed++;
        if (processed === files.length) {
          setHistoryErrors(allErrors);
          if (allRows.length) {
            setHistoryRows(allRows);
            const products = new Set(allRows.map(r => r.product)).size;
            setHistoryLabel(`${products} products · ${allRows.length} rows of history from ${files.map(f => f.name).join(', ')}`);
            if (csvProducts) onDataReady(csvProducts, allRows);
          }
        }
      };
      reader.readAsText(f);
    }
  }

  function runManual() {
    const valid = manualRows.filter(r => r.product.trim() && r.avgDailySales > 0);
    if (!valid.length) return;
    setManualSubmitted(true);
    onDataReady(valid, historyRows);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'csv',     label: '📁  Upload CSV' },
    { id: 'manual',  label: '✏️  Enter Manually' },
    { id: 'history', label: '📈  Sales History' },
  ];

  const tagCls = (color: string) =>
    `inline-block text-[11px] font-bold tracking-[0.4px] px-[10px] py-[3px] rounded-full mr-1.5 mb-1 ${color}`;

  return (
    <div className="mt-7 mb-7">
      <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[1.2px] mb-3.5">
        Load Inventory Data
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-[#E2E8F0]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] font-semibold rounded-t-lg transition-colors ${
              tab === t.id
                ? 'text-slate-900 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CSV TAB ── */}
      {tab === 'csv' && (
        <div>
          <div className="rounded-2xl p-6 mb-4 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE]">
            <span className="text-3xl mb-2 block">📋</span>
            <div className="text-[16px] font-extrabold text-slate-900 mb-2">Current Inventory Snapshot</div>
            <div className="text-[13px] text-slate-600 leading-[1.75] mb-3">
              Tell the system <strong>where you stand today</strong> — your products, how much stock you have on hand, how fast each item sells, and how long your supplier takes to deliver.
            </div>
            <span className={tagCls('bg-[#DBEAFE] text-[#1D4ED8]')}>PRODUCT</span>
            <span className={tagCls('bg-[#DBEAFE] text-[#1D4ED8]')}>CURRENT STOCK</span>
            <span className={tagCls('bg-[#DBEAFE] text-[#1D4ED8]')}>AVG DAILY SALES</span>
            <span className={tagCls('bg-[#DBEAFE] text-[#1D4ED8]')}>LEAD TIME (DAYS)</span>
            <br />
            <a
              href="/sample_data.csv"
              download
              className="inline-flex items-center gap-1.5 mt-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-3.5 py-2 text-[12px] font-semibold text-[#1D4ED8] hover:bg-blue-100 transition-colors"
            >
              ↗ View Sample File
            </a>
          </div>

          {csvProducts ? (
            <LoadedCard label={csvFileLabel} onClear={() => { setCsvProducts(null); setCsvFileLabel(''); setCsvErrors([]); setCsvNotices([]); }} />
          ) : (
            <DropZone onFiles={handleCSVFiles} />
          )}
          {csvErrors.map((e, i) => <p key={i} className="text-red-500 text-[12px] mt-2">{e}</p>)}
          {csvNotices.map((n, i) => <p key={i} className="text-amber-600 text-[12px] mt-2">⚠️ {n}</p>)}
        </div>
      )}

      {/* ── MANUAL TAB ── */}
      {tab === 'manual' && (
        <div>
          <div className="rounded-2xl p-6 mb-4 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0]">
            <span className="text-3xl mb-2 block">✏️</span>
            <div className="text-[16px] font-extrabold text-slate-900 mb-2">Enter Your Products Manually</div>
            <div className="text-[13px] text-slate-600 leading-[1.75] mb-3">
              No spreadsheet ready? No problem. Type your products directly into the table below. Add as many rows as you need — then hit <strong>Run Analysis</strong>.
            </div>
            <span className={tagCls('bg-[#DCFCE7] text-[#15803D]')}>NO FILE NEEDED</span>
            <span className={tagCls('bg-[#DCFCE7] text-[#15803D]')}>ADD UNLIMITED ROWS</span>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm mb-4">
            <ManualTable rows={manualRows} onChange={setManualRows} />
          </div>

          <button
            onClick={runManual}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-xl py-3 transition-colors"
          >
            Run Analysis
          </button>
          {manualSubmitted && (
            <p className="text-green-600 text-[12px] mt-2 font-medium">✓ Analysis running with your manual data.</p>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div>
          <div className="rounded-2xl p-6 mb-4 bg-gradient-to-br from-[#FFF7ED] to-[#FED7AA] border border-[#FDBA74]">
            <span className="text-3xl mb-2 block">📈</span>
            <div className="text-[16px] font-extrabold text-slate-900 mb-2">Sales History — Optional But Recommended</div>
            <div className="text-[13px] text-slate-600 leading-[1.75] mb-3">
              Upload 30–180 days of real daily sales and the system learns your actual patterns. Products matched by name will show a <strong>REAL DATA</strong> badge. Everything else uses a simulated forecast based on your Avg Daily Sales.
            </div>
            <span className={tagCls('bg-[#FED7AA] text-[#C2410C]')}>PRODUCT</span>
            <span className={tagCls('bg-[#FED7AA] text-[#C2410C]')}>DATE (YYYY-MM-DD)</span>
            <span className={tagCls('bg-[#FED7AA] text-[#C2410C]')}>UNITS SOLD</span>
            <br />
            <a
              href="/sample_history.csv"
              download
              className="inline-flex items-center gap-1.5 mt-3 bg-[#FFF7ED] border border-[#FDBA74] rounded-lg px-3.5 py-2 text-[12px] font-semibold text-[#C2410C] hover:bg-orange-100 transition-colors"
            >
              ↗ View Sample File
            </a>
          </div>

          {historyRows.length > 0 ? (
            <LoadedCard label={historyLabel} onClear={() => { setHistoryRows([]); setHistoryLabel(''); setHistoryErrors([]); }} />
          ) : (
            <>
              <DropZone onFiles={handleHistoryFiles} />
              <p className="text-[12px] text-slate-400 mt-2 text-center">
                No history uploaded yet — system will use simulated data based on Avg Daily Sales.
              </p>
            </>
          )}
          {historyErrors.map((e, i) => <p key={i} className="text-red-500 text-[12px] mt-2">{e}</p>)}
        </div>
      )}
    </div>
  );
}
