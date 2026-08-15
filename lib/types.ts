export interface Product {
  product: string;
  currentStock: number;
  avgDailySales: number;
  leadTimeDays: number;
}

export interface HistoryRow {
  product: string;
  date: string;
  unitsSold: number;
}

export type Status = 'urgent' | 'warning' | 'healthy';
export type TrendLabel = 'increasing' | 'decreasing' | 'stable';
export type DataSource = 'real' | 'simulated';

export interface AnalysisResult extends Product {
  status: Status;
  daysRemaining: number;
  daysUntilReorder: number;
  reorderQty: number;
  avgForecast: number;
  trendLabel: TrendLabel;
  trendEmoji: string;
  peakDate: string;
  dataSource: DataSource;
  wos: number;
}

export interface Settings {
  leadTime: number;
  safetyDays: number;
  cycleDays: number;
}

export type FilterOption = 'all' | 'urgent' | 'warning' | 'healthy';
