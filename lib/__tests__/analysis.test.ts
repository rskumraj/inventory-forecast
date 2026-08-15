import { describe, it, expect } from 'vitest';
import { analyzeProduct, runAnalysis } from '../analysis';
import type { Product, HistoryRow, Settings } from '../types';

const settings: Settings = { leadTime: 14, safetyDays: 7, cycleDays: 30 };

function product(overrides: Partial<Product> = {}): Product {
  return {
    product: 'Widget',
    currentStock: 100,
    avgDailySales: 5,
    leadTimeDays: 14,
    ...overrides,
  };
}

/** Builds `count` days of history ending today, at a flat daily rate unless a day-index-based override is supplied. */
function history(count: number, unitsSold: number | ((i: number) => number), name = 'Widget'): HistoryRow[] {
  const rows: HistoryRow[] = [];
  const start = new Date();
  start.setDate(start.getDate() - count);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    rows.push({
      product: name,
      date: d.toISOString().slice(0, 10),
      unitsSold: typeof unitsSold === 'function' ? unitsSold(i) : unitsSold,
    });
  }
  return rows;
}

describe('analyzeProduct', () => {
  it('returns null for zero or negative avg daily sales', () => {
    expect(analyzeProduct(product({ avgDailySales: 0 }), settings)).toBeNull();
    expect(analyzeProduct(product({ avgDailySales: -3 }), settings)).toBeNull();
  });

  it('flags urgent when the reorder window has already closed', () => {
    // Mirrors the old test_forecast.py "near-zero stock" case: 5 units at 3/day.
    const r = analyzeProduct(product({ currentStock: 5, avgDailySales: 3 }), settings);
    expect(r).not.toBeNull();
    expect(r!.status).toBe('urgent');
    expect(r!.daysUntilReorder).toBeLessThanOrEqual(0);
  });

  it('flags healthy for a slow seller with ample stock', () => {
    // Mirrors the old test_forecast.py "slow seller" case: 500 units at 0.5/day.
    const r = analyzeProduct(product({ currentStock: 500, avgDailySales: 0.5 }), settings);
    expect(r).not.toBeNull();
    expect(r!.status).toBe('healthy');
    expect(r!.daysUntilReorder).toBeGreaterThan(7);
  });

  it('flags warning inside the 0-7 day reorder window', () => {
    // days_remaining = leadTime + safetyDays + x, where 0 < x <= 7
    // stock/sales = 14 + 7 + 5 = 26 -> daysUntilReorder = 5
    const r = analyzeProduct(product({ currentStock: 130, avgDailySales: 5 }), settings);
    expect(r!.status).toBe('warning');
    expect(r!.daysUntilReorder).toBeGreaterThan(0);
    expect(r!.daysUntilReorder).toBeLessThanOrEqual(7);
  });

  it('computes reorder quantity as forecast * (cycle + safety)', () => {
    const r = analyzeProduct(product({ avgDailySales: 5 }), settings);
    expect(r!.reorderQty).toBeCloseTo(5 * (30 + 7));
  });

  it('falls back to settings.leadTime when the product has no lead time override', () => {
    const withOverride = analyzeProduct(product({ leadTimeDays: 21, currentStock: 100, avgDailySales: 5 }), settings)!;
    const withoutOverride = analyzeProduct(product({ leadTimeDays: 0, currentStock: 100, avgDailySales: 5 }), settings)!;
    // 21-day lead time eats further into the window than the 14-day default.
    expect(withOverride.daysUntilReorder).toBeLessThan(withoutOverride.daysUntilReorder);
  });

  it('stays on simulated data when history has fewer than 30 rows', () => {
    const hist = history(29, 5);
    const r = analyzeProduct(product({ avgDailySales: 5 }), settings, hist);
    expect(r!.dataSource).toBe('simulated');
  });

  it('switches to real data once history reaches 30 rows', () => {
    const hist = history(30, 5);
    const r = analyzeProduct(product({ avgDailySales: 5 }), settings, hist);
    expect(r!.dataSource).toBe('real');
    expect(r!.avgForecast).toBeCloseTo(5);
  });

  it('detects an increasing trend from the last 60 days of history', () => {
    // First week sells ~2/day, last week sells ~10/day -> a clear upward trend.
    const hist = history(60, i => (i < 7 ? 2 : i >= 53 ? 10 : 5));
    const r = analyzeProduct(product({ avgDailySales: 5 }), settings, hist);
    expect(r!.trendLabel).toBe('increasing');
    expect(r!.trendEmoji).toBe('📈');
  });

  it('detects a decreasing trend from the last 60 days of history', () => {
    const hist = history(60, i => (i < 7 ? 10 : i >= 53 ? 2 : 5));
    const r = analyzeProduct(product({ avgDailySales: 5 }), settings, hist);
    expect(r!.trendLabel).toBe('decreasing');
    expect(r!.trendEmoji).toBe('📉');
  });

  it('reports stable when sales barely move week to week', () => {
    const hist = history(35, 5);
    const r = analyzeProduct(product({ avgDailySales: 5 }), settings, hist);
    expect(r!.trendLabel).toBe('stable');
    expect(r!.trendEmoji).toBe('➡️');
  });
});

describe('runAnalysis', () => {
  it('sorts results urgent -> warning -> healthy', () => {
    const products: Product[] = [
      product({ product: 'Healthy Item', currentStock: 1000, avgDailySales: 1 }),
      product({ product: 'Urgent Item', currentStock: 1, avgDailySales: 10 }),
      product({ product: 'Warning Item', currentStock: 130, avgDailySales: 5 }),
    ];
    const results = runAnalysis(products, settings);
    expect(results.map(r => r.status)).toEqual(['urgent', 'warning', 'healthy']);
  });

  it('drops products with zero avg daily sales instead of throwing', () => {
    const products: Product[] = [product({ avgDailySales: 0 }), product({ product: 'Other', avgDailySales: 5 })];
    const results = runAnalysis(products, settings);
    expect(results).toHaveLength(1);
    expect(results[0].product).toBe('Other');
  });

  it('matches history to products case-insensitively and trims whitespace', () => {
    const products: Product[] = [product({ product: '  Widget  ', avgDailySales: 5 })];
    const hist = history(30, 5, 'widget');
    const results = runAnalysis(products, settings, hist);
    expect(results[0].dataSource).toBe('real');
  });
});
