// ─────────────────────────────────────────────
// FILE: src/admin/pages/OrdersPage.jsx
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, ShoppingBag, Clock, CheckCircle, XCircle, Truck, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

const STATUSES = ['All', 'Not submitted', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusStyle = {
  Delivered: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  Shipped: { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20', icon: Truck },
  Pending: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: Clock },
  Cancelled: { cls: 'bg-rose-500/15 text-rose-400 border-rose-500/20', icon: XCircle },
  Processing: { cls: 'bg-white/10 text-white/60 border-white/20', icon: ShoppingBag },
  'Not submitted': { cls: 'bg-orange-500/15 text-orange-300 border-orange-500/25', icon: AlertTriangle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    Promise.all([api.getOrders(), api.getCheckoutLeads()])
      .then(([ordersResponse, leadsResponse]) => {
        const rawOrders = ordersResponse.data || [];
        const mapped = rawOrders.map(o => {
          const productSummary = o.items && o.items.length 
            ? o.items.map(item => `${item.product_name} (x${item.quantity})`).join(', ')
            : 'Custom Order';
          
          return {
            id: o.order_number,
            dbId: o.id,
            customer: o.shipping_address?.name || o.user?.name || 'Guest User',
            email: o.user?.email || '',
            phone: o.shipping_address?.phone || '',
            product: productSummary,
            amount: parseFloat(o.total),
            status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
            date: o.created_at,
            isLead: false,
          };
        });

        const leads = (leadsResponse.data || []).map(lead => ({
          id: `LEAD-${lead.id}`,
          dbId: null,
          customer: lead.full_name || 'Unknown customer',
          email: '',
          phone: lead.phone || '',
          product: lead.items?.length
            ? lead.items.map(item => `${item.product_name} (x${item.quantity})`).join(', ')
            : 'Checkout lead',
          amount: parseFloat(lead.total || 0),
          status: 'Not submitted',
          date: lead.abandoned_at || lead.last_activity_at || lead.created_at,
          isLead: true,
        }));

        setOrders([...mapped, ...leads]);
      })
      .catch(err => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (dbId, newStatus) => {
    try {
      await api.updateOrderStatus(dbId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = orders
    .filter(o => {
      const matchSearch = !search
        || o.customer.toLowerCase().includes(search.toLowerCase())
        || o.email.toLowerCase().includes(search.toLowerCase())
        || o.phone.toLowerCase().includes(search.toLowerCase())
        || o.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'amount') { va = parseFloat(va); vb = parseFloat(vb); }
      if (sortKey === 'date') { va = new Date(va); vb = new Date(vb); }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Summary counts
  const counts = {};
  STATUSES.slice(1).forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + parseFloat(o.amount), 0);

  const SortIcon = ({ col }) => sortKey === col
    ? (sortDir === 'asc' ? <ChevronUp size={12} className="text-white/70" /> : <ChevronDown size={12} className="text-white/70" />)
    : <ChevronDown size={12} className="text-white/20" />;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#2a2a2a] bg-[#1c1c1c]/60 px-4 py-3">
          <p className="text-white/40 text-xs">Total Revenue</p>
          <p className="text-xl font-bold text-white/70 mt-0.5">${totalRevenue.toFixed(0)}</p>
        </div>
        {Object.entries(counts).map(([status, count]) => {
          const s = statusStyle[status] || { cls: 'bg-white/10 text-white/60 border-white/20' };
          return (
            <div key={status} className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c]/60 px-4 py-3">
              <p className="text-white/40 text-xs">{status}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.cls.split(' ')[1]}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search name, phone, or ID..." className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-xs placeholder-white/30 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-white/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? 'bg-white/15 text-white/80 border-white/25' : 'text-white/40 border-[#3a3a3a] hover:border-white/20'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {[
                  { label: 'Order ID', key: 'id' },
                  { label: 'Customer', key: 'customer' },
                  { label: 'Product', key: 'product' },
                  { label: 'Amount', key: 'amount' },
                  { label: 'Status', key: 'status' },
                  { label: 'Date', key: 'date' },
                  { label: 'Action', key: null },
                ].map(({ label, key }) => (
                  <th key={label}
                    onClick={key ? () => handleSort(key) : undefined}
                    className={`text-left text-white/40 font-medium py-3 px-4 whitespace-nowrap ${key ? 'cursor-pointer hover:text-white/70' : ''} select-none`}
                  >
                    <span className="flex items-center gap-1">{label}{key && <SortIcon col={key} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {paged.map(order => {
                const s = statusStyle[order.status] || { cls: 'bg-white/10 text-white/60', icon: ShoppingBag };
                return (
                  <tr key={order.id} className="hover:bg-[#252525]/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-white/70">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{order.customer}</p>
                      <p className="text-white/40 text-[10px]">{order.phone || order.email}</p>
                    </td>
                    <td className="px-4 py-3 text-white/60 max-w-[180px] truncate">{order.product}</td>
                    <td className="px-4 py-3 text-white font-semibold">{formatPrice(order.amount)}</td>
                    <td className="px-4 py-3">
                      {editingId === order.id && !order.isLead ? (
                        <select
                          defaultValue={order.status}
                          autoFocus
                          onBlur={e => { handleUpdateStatus(order.dbId, e.target.value); setEditingId(null); }}
                          onChange={e => { handleUpdateStatus(order.dbId, e.target.value); setEditingId(null); }}
                          className="bg-[#1c1c1c] border border-[#3a3a3a] text-white text-xs rounded-lg px-2 py-1 outline-none"
                        >
                          {STATUSES.slice(1).map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => !order.isLead && setEditingId(order.id)}
                          className={`text-[10px] font-medium px-2 py-1 rounded-full border ${s.cls} ${order.isLead ? 'cursor-default' : 'hover:opacity-80'} transition-opacity`}
                        >
                          {order.status}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                      {order.date ? format(parseISO(order.date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {order.isLead ? (
                        <span className="text-orange-300/70 text-[10px]">Needs follow-up</span>
                      ) : (
                        <button onClick={() => setEditingId(order.id)} className="text-white/40 hover:text-white/70 text-[10px] hover:underline transition-colors">Update status</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paged.length === 0 && <div className="text-center py-12 text-white/30 text-sm">{loading ? 'Loading orders...' : 'No orders match your filter'}</div>}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[#2a2a2a]">
            <p className="text-white/40 text-xs">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="px-3 py-1.5 text-xs text-white/50 bg-[#222222]/50 rounded-lg border border-[#3a3a3a] disabled:opacity-30 hover:bg-white/10 transition-all">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 text-xs rounded-lg border transition-all ${i === page ? 'bg-white/15 text-white/80 border-white/25' : 'text-white/40 border-[#3a3a3a] hover:border-white/20'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1} className="px-3 py-1.5 text-xs text-white/50 bg-[#222222]/50 rounded-lg border border-[#3a3a3a] disabled:opacity-30 hover:bg-white/10 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
