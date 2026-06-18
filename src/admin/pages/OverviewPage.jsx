import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Clock, DollarSign, Info, Percent, ShoppingBag, TrendingUp, Users } from 'lucide-react';

import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { isLocalSession } from '../auth';

const COLORS = ['#ffffff', '#a3a3a3', '#737373', '#525252', '#404040'];

const EMPTY_METRICS = {
  total_revenue: 0,
  total_orders: 0,
  unique_customers: 0,
  avg_session_time: 0,
  conversion_rate: 0,
  total_products: 0,
};

const statusStyle = {
  Delivered: 'bg-emerald-500/15 text-emerald-400',
  Shipped: 'bg-blue-500/15 text-blue-400',
  Pending: 'bg-amber-500/15 text-amber-400',
  Cancelled: 'bg-rose-500/15 text-rose-400',
  Processing: 'bg-white/10 text-white/60',
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatStatus = (status) => {
  if (!status) return 'Pending';
  return String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
};

const formatDuration = (seconds) => {
  const value = Math.max(0, Math.floor(toNumber(seconds)));
  return `${Math.floor(value / 60)}m ${value % 60}s`;
};

const formatDateLabel = (date) => {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getChartRows = (data, key) => data?.charts?.[key] ?? data?.[key] ?? [];

const normalizeRevenue = (rows) =>
  rows.map((row) => ({
    label: row.label ?? row.month ?? formatDateLabel(row.date),
    revenue: toNumber(row.revenue),
    orders: toNumber(row.orders),
  }));

const normalizeTraffic = (rows) =>
  rows.map((row) => ({
    label: row.label ?? row.day ?? formatDateLabel(row.date),
    views: toNumber(row.views ?? row.visits),
    visitors: toNumber(row.visitors),
  }));

const normalizeCategorySales = (rows) =>
  rows.map((row, idx) => ({
    name: row.name ?? 'Uncategorized',
    value: toNumber(row.value),
    revenue: toNumber(row.revenue),
    color: row.color ?? COLORS[idx % COLORS.length],
  }));

const normalizeOrder = (order) => {
  const productSummary = order.items?.length
    ? order.items.map((item) => `${item.product_name} (x${item.quantity})`).join(', ')
    : 'Order checkout';

  return {
    id: order.order_number || order.id,
    customer: order.shipping_address?.name || order.user?.name || 'Guest customer',
    product: productSummary,
    amount: toNumber(order.total ?? order.amount),
    status: formatStatus(order.status),
  };
};

const normalizeProduct = (product) => ({
  id: product.id,
  name: product.name,
  images: Array.isArray(product.images) ? product.images : [],
  category: typeof product.category === 'object' && product.category
    ? product.category.name
    : product.category || 'Uncategorized',
  price: toNumber(product.price),
  unitsSold: toNumber(product.units_sold),
  salesTotal: toNumber(product.sales_total),
  stock: toNumber(product.stock),
});

const EmptyState = ({ children, className = '' }) => (
  <div className={`flex min-h-[180px] items-center justify-center px-4 text-center text-sm text-white/30 ${className}`}>
    {children}
  </div>
);

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-xs shadow-2xl">
      <p className="mb-2 font-medium text-white/60">{label}</p>
      {payload.map((point) => {
        const key = String(point.dataKey || point.name).toLowerCase();
        const value = key.includes('revenue') || key.includes('sales')
          ? formatPrice(point.value)
          : toNumber(point.value).toLocaleString();

        return (
          <div key={point.dataKey || point.name} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: point.color || point.stroke }} />
            <span className="capitalize text-white/50">{point.name}:</span>
            <span className="font-semibold text-white">{value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function OverviewPage() {
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Local dev login uses a fake token — skip the protected API call.
    if (isLocalSession()) {
      setLoading(false);
      return;
    }

    api.getAdminDashboard()
      .then((data) => {
        setDbData(data);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching admin dashboard data:', err);
        setError(err.message || 'Unable to load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = Object.fromEntries(
    Object.entries(EMPTY_METRICS).map(([key, fallback]) => [
      key,
      toNumber(dbData?.metrics?.[key], fallback),
    ])
  );

  const chartRevenue = normalizeRevenue(getChartRows(dbData, 'revenue_history'));
  const chartCategory = normalizeCategorySales(getChartRows(dbData, 'category_sales'));
  const chartTraffic = normalizeTraffic(getChartRows(dbData, 'traffic_history'));
  const recentOrders = (dbData?.recent_orders ?? []).map(normalizeOrder);
  const topProducts = (dbData?.top_products ?? []).map(normalizeProduct);

  const localOnly = isLocalSession();

  return (
    <div className="space-y-6">
      {localOnly && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            You are signed in with the <strong>local dev password</strong>. Live dashboard data requires a real backend login.
            Create an admin account via the backend and log in with those credentials to see live stats.
          </span>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard title="Total Revenue" value={formatPrice(metrics.total_revenue)} change="From paid orders" trend="neutral" icon={DollarSign} color="neutral" loading={loading} />
        <StatCard title="Total Orders" value={metrics.total_orders} change="Database orders" trend="neutral" icon={ShoppingBag} color="emerald" loading={loading} />
        <StatCard title="Unique Visitors" value={metrics.unique_customers} change="Tracked visitors" trend="neutral" icon={Users} color="neutral" loading={loading} />
        <StatCard title="Avg Session Time" value={formatDuration(metrics.avg_session_time)} change="Tracked sessions" trend="neutral" icon={Clock} color="amber" loading={loading} />
        <StatCard title="Conversion Rate" value={metrics.conversion_rate} suffix="%" change="Orders / visitors" trend="neutral" icon={Percent} color="cyan" loading={loading} />
        <StatCard title="Products" value={metrics.total_products} change="Catalog products" trend="neutral" icon={TrendingUp} color="rose" loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Revenue Overview" subtitle="Paid revenue over the last 30 days" className="xl:col-span-2">
          {chartRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickFormatter={(value) => `${toNumber(value).toLocaleString()} DH`} />
                <Tooltip content={<TooltipBox />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#e5e5e5" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState>No paid revenue data yet.</EmptyState>
          )}
        </ChartCard>

        <ChartCard title="Sales by Category" subtitle="Paid order revenue distribution">
          {chartCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={chartCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {chartCategory.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {chartCategory.map((category) => (
                  <div key={category.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: category.color }} />
                    <span className="flex-1 text-white/60">{category.name}</span>
                    <span className="font-medium text-white">{category.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState>No category sales yet.</EmptyState>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Traffic" subtitle="Page views and unique visitors over the last 30 days">
          {chartTraffic.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartTraffic} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip content={<TooltipBox />} />
                <Bar dataKey="views" name="Views" fill="#d4d4d4" radius={[4, 4, 0, 0]} maxBarSize={32} opacity={0.85} />
                <Bar dataKey="visitors" name="Visitors" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState>No traffic events captured yet.</EmptyState>
          )}
        </ChartCard>

        <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm">
          <div className="border-b border-[#2a2a2a] px-6 py-4">
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            <p className="mt-0.5 text-xs text-white/40">{metrics.total_orders} total orders</p>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-[#2a2a2a]">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                    {order.customer?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">{order.customer}</p>
                    <p className="truncate text-xs text-white/40">{order.product}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-semibold text-white">{formatPrice(order.amount)}</p>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusStyle[order.status] || 'bg-white/10 text-white/50'}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No orders have been placed yet.</EmptyState>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm">
        <div className="border-b border-[#2a2a2a] px-6 py-4">
          <h3 className="text-sm font-semibold text-white">Top Products</h3>
          <p className="mt-0.5 text-xs text-white/40">Ranked by paid units sold</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['Product', 'Category', 'Revenue', 'Units Sold', 'Price', 'Stock'].map((heading) => (
                  <th key={heading} className={`py-3 font-medium text-white/40 ${heading === 'Product' ? 'px-6 text-left' : heading === 'Stock' ? 'px-6 text-right' : 'px-4 text-right'}`}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {topProducts.length > 0 ? topProducts.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-[#252525]/40">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="h-8 w-8 rounded-lg bg-white/5 object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-white/5" />
                      )}
                      <span className="font-medium text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-white/50">{product.category}</td>
                  <td className="px-4 py-3 text-right text-white">{formatPrice(product.salesTotal)}</td>
                  <td className="px-4 py-3 text-right text-white/60">{product.unitsSold}</td>
                  <td className="px-4 py-3 text-right text-white">{formatPrice(product.price)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`font-medium ${product.stock < 5 ? 'text-rose-400' : product.stock < 15 ? 'text-amber-400' : 'text-emerald-400'}`}>{product.stock}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState>No paid product sales yet.</EmptyState>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
