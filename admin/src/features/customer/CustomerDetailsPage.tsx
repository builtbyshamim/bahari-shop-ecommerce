import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetSingeCustomerDetailsQuery } from './customerApi';
import StatusBadge from '../../components/ui/status/StatusBadge';

// ── Types ────────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  items: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  avatar: string;
  status: 'active' | 'inactive';
  orders: Order[];
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const mockCustomer: Customer = {
  id: 'USR-00412',
  name: 'Rafiul Islam',
  email: 'rafiul@example.com',
  phone: '+880 1712-345678',
  address: '42 Jessore Road, Khulna, Bangladesh',
  role: 'CUSTOMER',
  joinedAt: '2023-06-15',
  totalOrders: 24,
  totalSpent: 18450,
  avatar: 'RI',
  status: 'active',
  orders: [
    { id: 'ORD-9821', date: '2024-03-10', amount: 2400, status: 'completed', items: 3 },
    { id: 'ORD-9654', date: '2024-02-28', amount: 850, status: 'completed', items: 1 },
    { id: 'ORD-9501', date: '2024-02-14', amount: 3200, status: 'pending', items: 5 },
    { id: 'ORD-9344', date: '2024-01-30', amount: 640, status: 'cancelled', items: 2 },
    { id: 'ORD-9210', date: '2024-01-18', amount: 1750, status: 'completed', items: 4 },
  ],
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white rounded-xl p-4 flex-1 min-w-[120px]">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
    <p className="text-2xl font-extrabold text-gray-800 tracking-tight">{value}</p>
  </div>
);

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-b-0">
    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-[12.5px] font-semibold text-gray-700 capitalize">{value || 'N/A'}</p>
    </div>
  </div>
);

const ActionBtn = ({
  icon,
  label,
  danger = false,
}: {
  icon: string;
  label: string;
  danger?: boolean;
}) => (
  <button
    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-colors text-left
      ${
        danger
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50'
      }`}
  >
    <span
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0
        ${danger ? 'bg-red-100' : 'bg-gray-100'}`}
    >
      {icon}
    </span>
    {label}
  </button>
);

// ── Activity Data ─────────────────────────────────────────────────────────────
const activityItems = [
  { time: '2 hours ago', text: 'Placed a new order #ORD-9821', icon: '🛍️' },
  { time: '3 days ago', text: 'Updated shipping address', icon: '📍' },
  { time: '1 week ago', text: 'Password changed', icon: '🔒' },
  { time: '2 weeks ago', text: 'Logged in from new device', icon: '💻' },
  { time: '1 month ago', text: 'Order #ORD-9344 was cancelled', icon: '❌' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const CustomerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data } = useGetSingeCustomerDetailsQuery(id, {
    skip: !id,
  });
  const customerData = data?.data || [];
  const [activeTab, setActiveTab] = useState<'orders' | 'activity'>('orders');
  const c = mockCustomer;
  const avg = Math.round(c.totalSpent / c.totalOrders);

  return (
    <div className="min-h-screen bg-gray-100 pb-6 font-[Nunito]">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary-500 mb-5 px-2 py-1.5 rounded-lg hover:bg-white transition-colors"
      >
        ← Back to customers
      </button>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mx-auto">
        {/* ── Left sidebar ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-orange-50 to-white px-5 pt-5 pb-4 flex flex-col items-center text-center gap-2.5 border-b border-gray-100">
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary-500 to-orange-300 flex items-center justify-center text-white text-2xl font-extrabold tracking-tight">
                {customerData?.avatar}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-800 tracking-tight mb-0.5">
                  {customerData?.name}
                </h2>
                <p className="text-xs font-semibold text-gray-400 mb-2">
                  {customerData.userId || 'N/A'}
                </p>
                <StatusBadge isActive={!customerData.isBanned} />
              </div>
            </div>

            {/* Info rows */}
            <div className="px-4 py-2">
              <InfoRow icon="✉️" label="Email" value={customerData.email} />
              <InfoRow icon="📞" label="Phone" value={customerData.phone} />
              <InfoRow icon="📍" label="Address" value={customerData.address} />
              <InfoRow
                icon="🗓️"
                label="Joined"
                value={new Date(customerData?.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
              <InfoRow icon="🏷️" label="Role" value={customerData?.role} />
            </div>
          </div>

          {/* Actions card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-2">
            <ActionBtn icon="✏️" label="Edit profile" />
            <ActionBtn icon="🔒" label="Reset password" />
            <ActionBtn icon="🚫" label="Deactivate account" danger />
          </div>
        </div>

        {/* ── Right content ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Stat cards */}
          <div className="flex gap-3 flex-wrap">
            <StatCard label="Total orders" value={String(c.totalOrders)} />
            <StatCard label="Total spent" value={fmt(c.totalSpent)} />
            <StatCard label="Avg. order" value={fmt(avg)} />
          </div>

          {/* Tab card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden border-l-[3px] border-l-primary-500">
            {/* Tab bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex gap-1">
                {(['orders', 'activity'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                      ${
                        activeTab === t
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-400">{c.totalOrders} total</span>
            </div>

            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div>
                {/* Table header */}
                <div className="grid grid-cols-[1.2fr_1fr_.7fr_1fr_.9fr] px-4 py-2.5 bg-gray-50">
                  {['Order ID', 'Date', 'Items', 'Amount', 'Status'].map((h) => (
                    <span
                      key={h}
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {/* Rows */}
                {c.orders.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-[1.2fr_1fr_.7fr_1fr_.9fr] items-center px-4 py-3 border-b border-gray-50 hover:bg-orange-50 cursor-pointer transition-colors last:border-b-0"
                  >
                    <span className="text-sm font-extrabold text-primary-500">{order.id}</span>
                    <span className="text-[12.5px] font-semibold text-gray-500">
                      {fmtDate(order.date)}
                    </span>
                    <span className="text-[12.5px] font-semibold text-gray-500">
                      {order.items} items
                    </span>
                    <span className="text-sm font-extrabold text-gray-800">
                      {fmt(order.amount)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                ))}
              </div>
            )}

            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div className="p-5">
                {activityItems.map((item, i) => (
                  <div key={i} className="flex gap-3.5 pb-5 relative last:pb-0">
                    {i < activityItems.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-100" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-gray-700 mb-0.5">{item.text}</p>
                      <p className="text-xs font-semibold text-gray-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
