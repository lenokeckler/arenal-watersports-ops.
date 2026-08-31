export interface BarChartPoint {
  label: string;
  value: number;
}

export interface SimpleBarChartProps {
  emptyState: string;
  formatValue?: (value: number) => string;
  points: BarChartPoint[];
  title: string;
}
