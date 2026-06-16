// ─────────────────────────────────────────────
// FILE: src/admin/AdminLayout.jsx
// ─────────────────────────────────────────────

import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export default function AdminLayout({ children, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#141414] text-white flex"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onLogout={onLogout} />

      {/* Main content */}
      <div
        className={`relative flex-1 flex flex-col min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}
        `}
      >
        <TopBar
          onMenuClick={() => setSidebarCollapsed(v => !v)}
          onRefresh={handleRefresh}
          onLogout={onLogout}
        />
        <main
          key={refreshKey}
          className="flex-1 p-4 md:p-6 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
