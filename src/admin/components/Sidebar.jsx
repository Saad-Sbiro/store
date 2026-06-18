// ─────────────────────────────────────────────
// FILE: src/admin/components/Sidebar.jsx
// ─────────────────────────────────────────────

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingBag,
  Settings, Sparkles, ExternalLink, X, KeyRound, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/visitors', label: 'Visitors', icon: Users },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/site-editor', label: 'Site Editor', icon: Settings },
  { to: '/admin/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/admin/account', label: 'Account', icon: KeyRound },
];

export default function Sidebar({ collapsed, setCollapsed, onLogout }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ease-expo
          bg-[#191919]/95 backdrop-blur-xl border-r border-[#2e2e2e]
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'w-64 translate-x-0'}
        `}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Logo area — text only, no icon */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#2e2e2e] ${collapsed ? 'lg:justify-center' : ''}`}>
          <span className={`font-bold text-white text-lg tracking-tight transition-all duration-200 ${collapsed ? 'lg:text-sm' : ''}`}>
            {collapsed ? 'A' : 'Admin'}
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto text-white/40 hover:text-white transition-colors lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => { if (window.innerWidth < 1024) setCollapsed(true); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                }
                ${collapsed ? 'lg:justify-center lg:px-0' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white/90'}`}
                  />
                  <span className={`transition-all duration-200 ${collapsed ? 'lg:hidden' : ''}`}>
                    {label}
                  </span>
                  {label === 'AI Insights' && (
                    <span className={`ml-auto text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full ${collapsed ? 'lg:hidden' : ''}`}>
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={`px-3 py-4 border-t border-[#2e2e2e] space-y-2`}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200 ${collapsed ? 'lg:justify-center' : ''}`}
          >
            <ExternalLink size={16} className="flex-shrink-0" />
            <span className={`${collapsed ? 'lg:hidden' : ''}`}>View Store</span>
          </a>
          <button
            type="button"
            onClick={onLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-all duration-200 hover:bg-white/5 hover:text-white/80 ${collapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className={`${collapsed ? 'lg:hidden' : ''}`}>Logout</span>
          </button>
          <div className={`px-3 py-2 ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="text-[10px] text-white/20">Admin Dashboard v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
