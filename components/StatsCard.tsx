
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-2">
      <div className={`${color} p-2 rounded-xl text-white`}>
        {icon}
      </div>
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
    </div>
  );
};

export default StatsCard;
