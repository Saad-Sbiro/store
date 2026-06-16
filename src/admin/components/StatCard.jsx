// ─────────────────────────────────────────────
// FILE: src/admin/components/StatCard.jsx
// ─────────────────────────────────────────────

import CountUp from 'react-countup';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CountUpComp = typeof CountUp === 'function' ? CountUp : (CountUp && CountUp.default) || (() => null);

export default function StatCard({ title, value, prefix = '', suffix = '', change, trend, icon: Icon, color = 'neutral', loading }) {
  const colorMap = {
    neutral: { ring: 'from-white/5 to-white/0', icon: 'bg-white/10 text-white/70', border: 'hover:border-white/20' },
    emerald: { ring: 'from-emerald-500/10 to-emerald-600/5', icon: 'bg-emerald-500/15 text-emerald-400', border: 'hover:border-emerald-500/20' },
    amber: { ring: 'from-amber-500/10 to-amber-600/5', icon: 'bg-amber-500/15 text-amber-400', border: 'hover:border-amber-500/20' },
    rose: { ring: 'from-rose-500/10 to-rose-600/5', icon: 'bg-rose-500/15 text-rose-400', border: 'hover:border-rose-500/20' },
    cyan: { ring: 'from-cyan-500/10 to-cyan-600/5', icon: 'bg-cyan-500/15 text-cyan-400', border: 'hover:border-cyan-500/20' },
    indigo: { ring: 'from-white/5 to-white/0', icon: 'bg-white/10 text-white/70', border: 'hover:border-white/20' },
    violet: { ring: 'from-white/5 to-white/0', icon: 'bg-white/10 text-white/70', border: 'hover:border-white/20' },
  };

  const c = colorMap[color] || colorMap.neutral;

  return (
    <div className={`relative group rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm p-5 overflow-hidden transition-all duration-300 ${c.border} hover:bg-[#252525]/90 hover:shadow-xl`}>
      {/* Gradient bg on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${c.ring} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative flex items-start justify-between mb-4">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center`}>
            <Icon size={15} />
          </div>
        )}
      </div>

      <div className="relative">
        {loading ? (
          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse mb-2" />
        ) : (
          <div className="text-2xl font-bold text-white mb-1 tabular-nums">
            {prefix}
            {typeof value === 'number' ? (
              <CountUpComp end={value} duration={1.4} separator="," decimals={value % 1 !== 0 ? 2 : 0} />
            ) : value}
            {suffix}
          </div>
        )}
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white/40'}`}>
            {trend === 'up' && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowDownRight size={12} />}
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
