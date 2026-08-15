'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DataInput from '@/components/DataInput';
import MetricCards from '@/components/MetricCards';
import ProductCard from '@/components/ProductCard';
import StockChart from '@/components/StockChart';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import TerminologyLegend from '@/components/TerminologyLegend';
import { runAnalysis } from '@/lib/analysis';
import type { Product, HistoryRow, AnalysisResult, Settings, FilterOption } from '@/lib/types';

export default function Home() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [history, setHistory]     = useState<HistoryRow[]>([]);
  const [results, setResults]     = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter]       = useState<FilterOption>('all');
  const [settings, setSettings]   = useState<Settings>({ leadTime: 14, safetyDays: 7, cycleDays: 30 });

  const analyze = useCallback((prods: Product[], hist: HistoryRow[], s: Settings) => {
    setIsAnalyzing(true);
    /* small delay so the loading animation always renders */
    setTimeout(() => {
      const r = runAnalysis(prods, s, hist);
      setResults(r);
      setIsAnalyzing(false);
    }, 1500);
  }, []);

  function handleDataReady(prods: Product[], hist: HistoryRow[]) {
    setProducts(prods);
    setHistory(hist);
    analyze(prods, hist, settings);
  }

  function handleSettingsChange(s: Settings) {
    setSettings(s);
    if (products.length > 0) analyze(products, history, s);
  }

  const displayed = results.filter(r => filter === 'all' || r.status === filter);
  const hasResults = results.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F3F7]">
      {/* Sidebar */}
      <Sidebar
        settings={settings}
        onSettingsChange={handleSettingsChange}
        filter={filter}
        onFilterChange={setFilter}
        hasResults={hasResults}
        results={results}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 main-scroll px-6 pb-10">
          {/* Data input */}
          <DataInput onDataReady={handleDataReady} defaultLeadTime={settings.leadTime} />

          {/* States */}
          {isAnalyzing && <LoadingState />}

          {!isAnalyzing && hasResults && (
            <>
              {/* KPI cards */}
              <MetricCards results={results} />

              {/* Recommendations */}
              <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[1.2px] mb-3.5">
                Recommendations — {displayed.length} products shown
              </div>

              {displayed.map(r => (
                <ProductCard key={r.product} result={r} defaultLeadTime={settings.leadTime} />
              ))}

              {/* Terminology */}
              <TerminologyLegend />

              {/* Chart */}
              <StockChart results={results} safeLevel={settings.leadTime + settings.safetyDays} />
            </>
          )}

          {!isAnalyzing && !hasResults && <EmptyState />}
        </main>
      </div>
    </div>
  );
}
