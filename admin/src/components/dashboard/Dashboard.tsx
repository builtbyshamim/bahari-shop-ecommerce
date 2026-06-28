import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  BadgeDollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  BarChart3,
  CalendarDays,
} from 'lucide-react';
import moment from 'moment';
import { useGetDashboardSummaryQuery } from '../../redux/api/dashboardApi';

// ─── helpers ─────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(n);

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100   text-amber-700',
  confirmed: 'bg-blue-100    text-blue-700',
  processing: 'bg-violet-100  text-violet-700',
  shipped: 'bg-cyan-100    text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100     text-red-700',
  refunded: 'bg-gray-100    text-gray-600',
};

const PAYMENT_STYLE: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-red-100   text-red-700',
  partial: 'bg-yellow-100 text-yellow-700',
};

// ─── Date period types ────────────────────────────────────────
type Period = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

const PERIOD_LABELS: Record<Period, string> = {
  all: 'All Time',
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  custom: 'Custom',
};

function getPeriodRange(period: Period): DateRange {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case 'today':
      return {
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
      };
    case 'week': {
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 6);
      return { startDate: weekStart.toISOString(), endDate: todayEnd.toISOString() };
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { startDate: monthStart.toISOString(), endDate: todayEnd.toISOString() };
    }
    case 'year': {
      const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return { startDate: yearStart.toISOString(), endDate: todayEnd.toISOString() };
    }
    default:
      return {};
  }
}

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
);

// ─── Bar chart (pure CSS) ─────────────────────────────────────
const BarChart = ({ data }: { data: { month: string; revenue: number; orders: number }[] }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex items-end gap-1.5 h-40 w-full pt-2">
      {data.map((d, i) => {
        const pct = Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex justify-center">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-gray-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  <p>৳{fmt(d.revenue)}</p>
                  <p className="text-gray-300">{d.orders} orders</p>
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
              </div>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#ff6d29] to-[#ffb347] transition-all duration-500 cursor-pointer hover:from-[#e65a1f] hover:to-[#ff8c42]"
                style={{ height: `${(pct / 100) * 128}px` }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────
const Dashboard = () => {
  const [period, setPeriod] = useState<Period>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Compute query params based on selected period
  const queryParams =
    period === 'all'
      ? {}
      : period === 'custom'
        ? customStart && customEnd
          ? {
              startDate: new Date(customStart + 'T00:00:00').toISOString(),
              endDate: new Date(customEnd + 'T23:59:59').toISOString(),
            }
          : {}
        : getPeriodRange(period);

  const { data: res, isLoading, isFetching, refetch } = useGetDashboardSummaryQuery(queryParams);

  const d = res?.data;
  const stats = d?.stats;
  const statusBreakdown: { status: string; count: number; color: string }[] =
    d?.statusBreakdown ?? [];
  const monthlyRevenue: { month: string; revenue: number; orders: number }[] =
    d?.monthlyRevenue ?? [];
  const recentOrders: any[] = d?.recentOrders ?? [];

  const totalStatusCount = statusBreakdown.reduce((s, b) => s + b.count, 0) || 1;

  // Determine sub-label for stat cards
  const isFiltered = period !== 'all';
  const periodLabel = PERIOD_LABELS[period];

  const STAT_CARDS = [
    {
      title: 'Total Revenue',
      value: `৳${fmt(stats?.totalRevenue ?? 0)}`,
      sub: isFiltered
        ? `${periodLabel} · Today: ৳${fmt(stats?.todayRevenue ?? 0)}`
        : `Today: ৳${fmt(stats?.todayRevenue ?? 0)}`,
      icon: <BadgeDollarSign className="h-5 w-5" />,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      trend: stats?.todayRevenue > 0,
    },
    {
      title: 'Total Orders',
      value: fmt(stats?.totalOrders ?? 0),
      sub: isFiltered
        ? `${periodLabel} · Today: ${stats?.todayOrders ?? 0}`
        : `Today: ${stats?.todayOrders ?? 0} orders`,
      icon: <ShoppingCart className="h-5 w-5" />,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      trend: (stats?.todayOrders ?? 0) > 0,
    },
    {
      title: 'Customers',
      value: fmt(stats?.totalCustomers ?? 0),
      sub: 'Registered users',
      icon: <Users className="h-5 w-5" />,
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      trend: true,
    },
    {
      title: 'Pending Orders',
      value: fmt(stats?.pendingOrders ?? 0),
      sub: `${stats?.deliveredOrders ?? 0} delivered`,
      icon: <Clock className="h-5 w-5" />,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      trend: (stats?.pendingOrders ?? 0) === 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <span>Home</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#ff6d29]">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live overview of your store performance</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Date Filter ── */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4 text-[#ff6d29]" />
            <span className="font-medium text-gray-600">Period:</span>
          </div>

          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                period === p
                  ? 'bg-[#ff6d29] text-white border-[#ff6d29]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#ff6d29] hover:text-[#ff6d29]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium whitespace-nowrap">From</label>
              <input
                type="date"
                value={customStart}
                max={customEnd || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCustomStart(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ff6d29]/30 focus:border-[#ff6d29] text-gray-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium whitespace-nowrap">To</label>
              <input
                type="date"
                value={customEnd}
                min={customStart}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ff6d29]/30 focus:border-[#ff6d29] text-gray-700"
              />
            </div>
            {customStart && customEnd && (
              <span className="text-xs text-emerald-600 font-medium">
                {moment(customStart).format('DD MMM YYYY')} –{' '}
                {moment(customEnd).format('DD MMM YYYY')}
              </span>
            )}
            {customStart && customEnd && (
              <button
                onClick={() => {
                  setCustomStart('');
                  setCustomEnd('');
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Active filter badge */}
        {period !== 'all' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">
              Showing data for:{' '}
              <span className="font-medium text-[#ff6d29]">
                {period === 'custom' && customStart && customEnd
                  ? `${moment(customStart).format('DD MMM YYYY')} – ${moment(customEnd).format('DD MMM YYYY')}`
                  : PERIOD_LABELS[period]}
              </span>
            </span>
            <button
              onClick={() => setPeriod('all')}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              × Reset
            </button>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <span className={card.text}>{card.icon}</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-14" />
              ) : (
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${card.trend ? 'text-emerald-600' : 'text-red-500'}`}
                >
                  {card.trend ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                </span>
              )}
            </div>
            {isLoading || isFetching ? (
              <>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart — 2/3 */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#ff6d29]" />
              <h3 className="font-semibold text-gray-800 text-sm">Monthly Revenue</h3>
            </div>
            <span className="text-xs text-gray-400">
              {period === 'all'
                ? 'Last 12 months'
                : period === 'custom' && customStart && customEnd
                  ? `${moment(customStart).format('DD MMM YYYY')} – ${moment(customEnd).format('DD MMM YYYY')}`
                  : PERIOD_LABELS[period]}
            </span>
          </div>
          {isLoading || isFetching ? (
            <div className="flex items-end gap-1.5 h-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <Skeleton className="w-full" style={{ height: `${20 + Math.random() * 80}px` }} />
                  <Skeleton className="w-4 h-2" />
                </div>
              ))}
            </div>
          ) : (
            <BarChart data={monthlyRevenue} />
          )}
          {!isLoading && !isFetching && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#ff6d29]" />
                Revenue (৳)
              </div>
              <div className="ml-auto font-medium text-gray-700">
                Total: ৳{fmt(monthlyRevenue.reduce((s, m) => s + m.revenue, 0))}
              </div>
            </div>
          )}
        </div>

        {/* Order status breakdown — 1/3 */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-[#ff6d29]" />
            <h3 className="font-semibold text-gray-800 text-sm">Order Status</h3>
          </div>

          {isLoading || isFetching ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {statusBreakdown.map((s) => {
                const pct = Math.round((s.count / totalStatusCount) * 100);
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600 capitalize">{s.status}</span>
                      <span className="text-gray-500">
                        {s.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick stat pills */}
          {!isLoading && !isFetching && (
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="bg-emerald-50 rounded-lg p-2 text-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-emerald-700">
                  {fmt(stats?.deliveredOrders ?? 0)}
                </p>
                <p className="text-[10px] text-emerald-500">Delivered</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-red-600">{fmt(stats?.cancelledOrders ?? 0)}</p>
                <p className="text-[10px] text-red-400">Cancelled</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Campaign attribution quick link ── */}
      <Link
        to="/admin/reports/campaigns"
        className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl px-5 py-4 hover:shadow-md transition-shadow group"
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">Campaign Attribution</p>
          <p className="text-xs text-gray-500 mt-0.5">
            See which Facebook / Google campaigns are driving your sales
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-pink-500 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* ── Recent orders ── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Recent Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs text-[#ff6d29] hover:underline flex items-center gap-1"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {isLoading || isFetching ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-gray-700">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium truncate max-w-[140px]">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {moment(order.createdAt).format('DD MMM, hh:mm A')}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-800">
                      ৳{fmt(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 text-[11px] rounded-full font-medium capitalize ${PAYMENT_STYLE[order.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] rounded-full font-medium capitalize ${STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/admin/manage-orders/${order.id}`}
                        className="text-[#ff6d29] hover:underline text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
