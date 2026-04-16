import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  borderColor?: string;
  gradient?: string;
  trend?: { direction: 'up' | 'down'; percent: number };
}

export default function StatCard({
  label,
  value,
  icon,
  borderColor = 'border-red-700',
  gradient,
  trend,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl shadow-sm p-6 border-l-4 ${borderColor} hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${
        gradient ? gradient : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.direction === 'up' ? '▲' : '▼'} {trend.percent}%
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
