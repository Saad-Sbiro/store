// ─────────────────────────────────────────────
// FILE: src/admin/components/TopBar.jsx
// ─────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, RefreshCw, Download, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const pageTitles = {
  '/admin': { title: 'Overview', sub: 'Store performance at a glance' },
  '/admin/visitors': { title: 'Visitors', sub: 'Visitor analytics & session data' },
  '/admin/products': { title: 'Products', sub: 'Manage your product catalog' },
  '/admin/orders': { title: 'Orders', sub: 'View and manage orders' },
  '/admin/site-editor': { title: 'Site Editor', sub: 'Customize your storefront' },
  '/admin/ai-insights': { title: 'AI Insights', sub: 'AI-powered reports & recommendations' },
  '/admin/account': { title: 'Account', sub: 'Password and session controls' },
};

export default function TopBar({ onMenuClick, onRefresh, onLogout }) {
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const info = pageTitles[location.pathname] || pageTitles['/admin'];

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleExport = () => {
    alert('Export coming soon — will download CSV/PDF report');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#141414]/85 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-lg leading-none">{info.title}</h1>
          <p className="text-white/40 text-xs mt-0.5">{info.sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/3 rounded-lg border border-[#2a2a2a] text-white/40 text-xs">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          {format(now, 'EEE, MMM d · HH:mm:ss')}
        </div>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all"
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={handleExport}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/3 hover:bg-white/8 rounded-lg border border-[#2a2a2a] transition-all"
        >
          <Download size={13} />
          Export
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
