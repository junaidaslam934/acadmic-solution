import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  borderColor?: string;
}

export default function StatCard({ label, value, icon, borderColor = 'border-blue-600' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
