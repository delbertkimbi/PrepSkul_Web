import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
};

function trendStyle(trend?: number) {
  if (trend === undefined) return { color: 'text-gray-500', icon: Minus };
  if (trend > 0) return { color: 'text-green-600', icon: ArrowUpRight };
  if (trend < 0) return { color: 'text-red-600', icon: ArrowDownRight };
  return { color: 'text-yellow-600', icon: Minus };
}

export default function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  const cfg = trendStyle(trend);
  const TrendIcon = cfg.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-600">{title}</p>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}
