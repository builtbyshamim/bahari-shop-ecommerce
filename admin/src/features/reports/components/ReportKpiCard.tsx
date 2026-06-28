import React from 'react';

interface Props {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'orange' | 'green' | 'blue' | 'red' | 'purple' | 'yellow';
  sub?: string;
}

const colorMap = {
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
};

const iconBg = {
  orange: 'bg-orange-100 text-orange-500',
  green: 'bg-green-100 text-green-500',
  blue: 'bg-blue-100 text-blue-500',
  red: 'bg-red-100 text-red-500',
  purple: 'bg-purple-100 text-purple-500',
  yellow: 'bg-yellow-100 text-yellow-500',
};

export default function ReportKpiCard({ label, value, icon, color = 'orange', sub }: Props) {
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${colorMap[color]}`}>
      {icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${iconBg[color]}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-70 truncate">{label}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
