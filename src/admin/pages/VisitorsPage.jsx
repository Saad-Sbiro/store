import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Clock, Globe, Monitor, Search, Trash2, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import { useAdminStore } from '../../store/useAdminStore';
import { getDisplayCountry } from '../../utils/geo';

const countryColors = ['#ffffff', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#10b981'];

const EmptyState = ({ children, className = '' }) => (
  <div className={`flex min-h-[160px] items-center justify-center px-4 text-center text-sm text-white/30 ${className}`}>
    {children}
  </div>
);

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1c1c] px-3 py-2 text-xs shadow-2xl">
      <p className="mb-1 text-white/60">{label}</p>
      {payload.map((point) => (
        <div key={point.dataKey || point.name} className="flex gap-2">
          <span className="text-white/50">{point.name}:</span>
          <span className="font-semibold text-white">{point.value}</span>
        </div>
      ))}
    </div>
  );
};

const percentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

export default function VisitorsPage() {
  const { sessions, clearSessions } = useAdminStore();
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('All');

  const sessionCount = sessions.length;
  const avgTime = sessionCount > 0
    ? Math.round(sessions.reduce((sum, session) => sum + (session.timeSpent || 0), 0) / sessionCount)
    : 0;
  const avgLoad = sessionCount > 0
    ? Math.round(sessions.reduce((sum, session) => sum + (session.perf?.fullLoad || 0), 0) / sessionCount)
    : 0;
  const avgScrollDepth = sessionCount > 0
    ? Math.round(sessions.reduce((sum, session) => sum + (session.scrollDepth || 0), 0) / sessionCount)
    : 0;
  const avgPages = sessionCount > 0
    ? (sessions.reduce((sum, session) => sum + (session.pages?.length || 1), 0) / sessionCount).toFixed(1)
    : '0.0';

  const countryCounts = {};
  sessions.forEach((session) => {
    const country = getDisplayCountry(session.geo, '');
    if (!country) return;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const countryData = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value], index) => ({ name, value, color: countryColors[index] }));

  const deviceCounts = {};
  sessions.forEach((session) => {
    const device = session.device || 'Unknown';
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  });
  const deviceData = Object.entries(deviceCounts)
    .map(([name, value], index) => ({ name, value, color: countryColors[index] }));

  const browserCounts = {};
  sessions.forEach((session) => {
    const browser = session.browser || 'Unknown';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });
  const browserData = Object.entries(browserCounts)
    .map(([name, value], index) => ({ name, value, color: countryColors[index] }));

  const hourlyData = Array.from({ length: 12 }, (_, index) => {
    const hour = (new Date().getHours() - 11 + index + 24) % 24;
    const visits = sessions.filter((session) => (
      session.startTime && new Date(session.startTime).getHours() === hour
    )).length;
    return { hour: `${hour}:00`, visits };
  });

  const loadBuckets = [
    { label: '<1s', count: sessions.filter((session) => (session.perf?.fullLoad || 0) > 0 && (session.perf?.fullLoad || 0) < 1000).length },
    { label: '1-2s', count: sessions.filter((session) => { const load = session.perf?.fullLoad || 0; return load >= 1000 && load < 2000; }).length },
    { label: '2-3s', count: sessions.filter((session) => { const load = session.perf?.fullLoad || 0; return load >= 2000 && load < 3000; }).length },
    { label: '>3s', count: sessions.filter((session) => (session.perf?.fullLoad || 0) >= 3000).length },
  ];

  const filtered = sessions.filter((session) => {
    const query = search.toLowerCase();
    const country = getDisplayCountry(session.geo, '');
    const matchesSearch = !query
      || country.toLowerCase().includes(query)
      || (session.browser || '').toLowerCase().includes(query);
    const matchesDevice = deviceFilter === 'All' || session.device === deviceFilter;
    return matchesSearch && matchesDevice;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sessions" value={sessionCount} change="Tracked sessions" trend="neutral" icon={Globe} color="neutral" />
        <StatCard title="Avg Time on Site" value={`${Math.floor(avgTime / 60)}m ${avgTime % 60}s`} change="Tracked sessions" trend="neutral" icon={Clock} color="emerald" />
        <StatCard title="Avg Page Load" value={`${(avgLoad / 1000).toFixed(1)}s`} change={sessionCount > 0 ? (avgLoad > 2000 ? 'Needs improvement' : 'Good performance') : 'No sessions yet'} trend={sessionCount > 0 && avgLoad > 2000 ? 'down' : 'neutral'} icon={Zap} color={avgLoad > 2000 ? 'rose' : 'amber'} />
        <StatCard title="Avg Scroll Depth" value={avgScrollDepth} suffix="%" change={`${avgPages} pages / session`} trend="neutral" icon={Monitor} color="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Hourly Traffic" subtitle="Visits in the last 12 hours">
          {sessionCount > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<TooltipBox />} />
                <Line type="monotone" dataKey="visits" stroke="#e5e5e5" strokeWidth={2} dot={{ fill: '#e5e5e5', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState>No sessions captured yet.</EmptyState>
          )}
        </ChartCard>

        <ChartCard title="Page Load Distribution" subtitle="Time to fully load">
          {sessionCount > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={loadBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<TooltipBox />} />
                <Bar dataKey="count" fill="#a3a3a3" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState>No page-load data captured yet.</EmptyState>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Top Countries" subtitle="Visitor origins" className="xl:col-span-1">
          {countryData.length > 0 ? (
            <div className="mt-2 space-y-2.5">
              {countryData.map((country) => (
                <div key={country.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-white/70">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: country.color }} />
                      {country.name}
                    </span>
                    <span className="font-medium text-white">{country.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage(country.value, sessionCount)}%`, background: country.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No visitor origins captured yet.</EmptyState>
          )}
        </ChartCard>

        <ChartCard title="Devices" subtitle="Desktop / Mobile / Tablet">
          {deviceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                    {deviceData.map((device) => <Cell key={device.name} fill={device.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {deviceData.map((device) => (
                  <div key={device.name} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-white/60"><span className="h-2 w-2 rounded-full" style={{ background: device.color }} />{device.name}</span>
                    <span className="font-medium text-white">{percentage(device.value, sessionCount)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState>No device data captured yet.</EmptyState>
          )}
        </ChartCard>

        <ChartCard title="Browsers" subtitle="Browser breakdown">
          {browserData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={browserData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                    {browserData.map((browser) => <Cell key={browser.name} fill={browser.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {browserData.map((browser) => (
                  <div key={browser.name} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-white/60"><span className="h-2 w-2 rounded-full" style={{ background: browser.color }} />{browser.name}</span>
                    <span className="font-medium text-white">{percentage(browser.value, sessionCount)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState>No browser data captured yet.</EmptyState>
          )}
        </ChartCard>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 border-b border-[#2a2a2a] px-4 sm:px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Session Log</h3>
            <p className="mt-0.5 text-xs text-white/40">{filtered.length} sessions</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search country, browser..." className="w-full rounded-lg border border-[#3a3a3a] bg-[#222222]/50 py-2 pl-8 pr-3 text-xs text-white outline-none placeholder-white/30 focus:border-white/30" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Desktop', 'Mobile', 'Tablet'].map((filter) => (
                <button key={filter} onClick={() => setDeviceFilter(filter)} className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${deviceFilter === filter ? 'border-white/25 bg-white/15 text-white/80' : 'border-[#3a3a3a] bg-[#222222]/50 text-white/40 hover:text-white/70'}`}>{filter}</button>
              ))}
              {sessionCount > 0 && (
                <button onClick={clearSessions} className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 transition-all hover:text-rose-300"><Trash2 size={12} /> Clear</button>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['Time', 'Country', 'City', 'Device', 'Browser', 'OS', 'Time on Site', 'Load', 'Pages', 'Clicks', 'Source'].map((heading) => (
                  <th key={heading} className="whitespace-nowrap px-4 py-3 text-left font-medium text-white/40">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filtered.slice(0, 50).map((session, index) => (
                <tr key={session.sessionId || index} className="transition-colors hover:bg-[#252525]/40">
                  <td className="whitespace-nowrap px-4 py-2.5 text-white/50">{session.startTime ? format(parseISO(session.startTime), 'MMM d, HH:mm') : '-'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-white">{getDisplayCountry(session.geo, '-')}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-white/50">{session.geo?.city || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${session.device === 'Mobile' ? 'bg-blue-500/15 text-blue-400' : session.device === 'Tablet' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-white/70'}`}>{session.device || '-'}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-white/60">{session.browser || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-white/50">{session.os || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-white">{session.timeSpent ? `${Math.floor(session.timeSpent / 60)}m ${session.timeSpent % 60}s` : '-'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={session.perf?.fullLoad > 2000 ? 'text-rose-400' : 'text-emerald-400'}>{session.perf?.fullLoad ? `${(session.perf.fullLoad / 1000).toFixed(1)}s` : '-'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-white/60">{session.pages?.length || '-'}</td>
                  <td className="px-4 py-2.5 text-white/60">{session.clicks ?? '-'}</td>
                  <td className="max-w-[120px] truncate whitespace-nowrap px-4 py-2.5 text-white/50">{session.referrer || 'Direct'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-white/30">
              {sessionCount === 0 ? 'No tracked sessions yet.' : 'No sessions match your filter.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
