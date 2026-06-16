// ─────────────────────────────────────────────
// FILE: src/admin/components/ChartCard.jsx
// ─────────────────────────────────────────────

export default function ChartCard({ title, subtitle, children, action, className = '' }) {
  return (
    <div className={`rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#2a2a2a]">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
