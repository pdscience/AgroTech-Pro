import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'amber' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = 'emerald' }) => {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-slate-600 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color]} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center text-xs text-slate-400 font-medium">
         {subtitle}
      </div>
    </div>
  );
};

export default StatCard;