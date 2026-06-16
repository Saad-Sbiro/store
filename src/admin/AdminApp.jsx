// ─────────────────────────────────────────────
// FILE: src/admin/AdminApp.jsx
// Admin shell: auth gate + layout + routing
// ─────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { isAuthenticated, logout } from './auth';
import { api } from '../services/api';
import AdminLayout from './AdminLayout';
import OverviewPage from './pages/OverviewPage';
import VisitorsPage from './pages/VisitorsPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import SiteEditorPage from './pages/SiteEditorPage';
import AIInsightsPage from './pages/AIInsightsPage';
import AccountPage from './pages/AccountPage';

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  const handleLogout = useCallback(async () => {
    await api.logout();
    logout();
    setAuthed(false);
  }, []);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="site-editor" element={<SiteEditorPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
