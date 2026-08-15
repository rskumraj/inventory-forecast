import type { Product, HistoryRow, AnalysisResult, Settings, TrendLabel } from './types';

function computeFromHistory(rows: HistoryRow[]): {
  avgForecast: number;
  trendLabel: TrendLabel;
  trendEmoji: string;
  peakDate: string;
} | null {
  if (rows.length < 30) return null;

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-60);

  const avg = recent.reduce((s, r) => s + r.unitsSold, 0) / recent.length;
  if (avg <= 0) return null;

  const firstWeekAvg = recent.slice(0, 7).reduce((s, r) => s + r.unitsSold, 0) / 7;
  const lastWeekAvg  = recent.slice(-7).reduce((s, r) => s + r.unitsSold, 0) / 7;
  const diff = lastWeekAvg - firstWeekAvg;

  const peakRow = recent.reduce((max, r) => r.unitsSold > max.unitsSold ? r : max, recent[0]);
  const peakDate = new Date(peakRow.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  let trendLabel: TrendLabel = 'stable';
  let trendEmoji = '➡️';
  if (diff > avg * 0.1)       { trendLabel = 'increasing'; trendEmoji = '📈'; }
  else if (diff < -avg * 0.1) { trendLabel = 'decreasing'; trendEmoji = '📉'; }

  return { avgForecast: avg, trendLabel, trendEmoji, peakDate };
}

export function analyzeProduct(
  product: Product,
  settings: Settings,
  history?: HistoryRow[],
): AnalysisResult | null {
  if (product.avgDailySales <= 0) return null;

  const leadTime = product.leadTimeDays || settings.leadTime;

  let avgForecast = product.avgDailySales;
  let trendLabel: TrendLabel = 'stable';
  let trendEmoji = '➡️';
  let peakDate = 'N/A';
  let dataSource: 'real' | 'simulated' = 'simulated';

  if (history && history.length >= 30) {
    const fromHistory = computeFromHistory(history);
    if (fromHistory) {
      avgForecast = fromHistory.avgForecast;
      trendLabel  = fromHistory.trendLabel;
      trendEmoji  = fromHistory.trendEmoji;
      peakDate    = fromHistory.peakDate;
      dataSource  = 'real';
    }
  }

  const daysRemaining     = product.currentStock / avgForecast;
  const daysUntilReorder  = daysRemaining - leadTime - settings.safetyDays;
  const reorderQty        = avgForecast * (settings.cycleDays + settings.safetyDays);
  const wos               = daysRemaining / 7;

  const status =
    daysUntilReorder <= 0 ? 'urgent' :
    daysUntilReorder <= 7 ? 'warning' : 'healthy';

  return {
    ...product,
    status,
    daysRemaining,
    daysUntilReorder,
    reorderQty,
    avgForecast,
    trendLabel,
    trendEmoji,
    peakDate,
    dataSource,
    wos,
  };
}

export function runAnalysis(
  products: Product[],
  settings: Settings,
  historyData?: HistoryRow[],
): AnalysisResult[] {
  const historyLookup: Record<string, HistoryRow[]> = {};
  if (historyData) {
    for (const row of historyData) {
      const key = row.product.trim().toLowerCase();
      if (!historyLookup[key]) historyLookup[key] = [];
      historyLookup[key].push(row);
    }
  }

  const results: AnalysisResult[] = [];
  for (const p of products) {
    const key = p.product.trim().toLowerCase();
    const result = analyzeProduct(p, settings, historyLookup[key]);
    if (result) results.push(result);
  }

  const order = { urgent: 0, warning: 1, healthy: 2 };
  return results.sort((a, b) => order[a.status] - order[b.status]);
}
