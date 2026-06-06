import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  warning?: boolean;
};

export function StatCard({ title, value, icon, warning }: StatCardProps) {
  return (
    <div className="brand-card rounded-lg p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-lg p-3 ${warning ? 'bg-[#F5F3E6] text-[#5d4a27]' : 'bg-[#CFE0DC] text-[#1d3b39]'}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
