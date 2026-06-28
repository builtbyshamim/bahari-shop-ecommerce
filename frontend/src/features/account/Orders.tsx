'use client';

import { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  X,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import AccountLayout from './AccountLayout';
import { useGetMyOrdersQuery } from '@/redux/api/orderApi';
import { useRouter } from 'next/navigation';

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    style: string;
    icon: any;
  }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    style: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    style: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    style: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  shipped: {
    label: 'On the Way',
    icon: Truck,
    style: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    style: 'text-green-700 bg-green-50 border-green-200',
  },
  cancelled: { label: 'Cancelled', icon: X, style: 'text-red-600 bg-red-50 border-red-200' },
  refunded: {
    label: 'Refunded',
    icon: RefreshCw,
    style: 'text-purple-700 bg-purple-50 border-purple-200',
  },
};

const FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function OrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const { data, isLoading, isError, refetch } = useGetMyOrdersQuery('');
  console.log('Orders data:', data);

  const orders: any[] = data?.data ?? [];
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  // ── Loading ──
  if (isLoading) {
    return (
      <AccountLayout activeTab="orders">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={30} className="animate-spin text-primary-400" />
        </div>
      </AccountLayout>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <AccountLayout activeTab="orders">
        <div className="bg-white rounded-2xl border border-black-200 py-16 flex flex-col items-center gap-4">
          <X size={32} className="text-red-400" />
          <p className="text-sm text-black-500 font-medium">Failed to load orders</p>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-primary-500 border border-primary-200 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout activeTab="orders">
      <div className="flex flex-col gap-4">
        {/* ── Filter pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full capitalize border transition-all
                ${
                  filter === f
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-200/50'
                    : 'bg-white text-black-500 border-black-200 hover:border-primary-300'
                }`}
            >
              {f === 'all' ? 'All Orders' : f}
              {f !== 'all' && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({orders.filter((o) => o.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Empty ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black-200 py-20 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-black-100 flex items-center justify-center">
              <Package size={30} className="text-black-300" />
            </div>
            <p className="text-sm font-bold text-black-700">No orders found</p>
            <p className="text-xs text-black-400">
              {filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const SIcon = cfg.icon;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-black-200 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
                >
                  {/* ── Top row ── */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-black-800 font-mono truncate">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-black-400 mt-0.5">
                        {formatDate(order.createdAt)} · {order.items?.length ?? 0} item
                        {order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.style}`}
                    >
                      <SIcon size={10} /> {cfg.label}
                    </span>
                  </div>

                  {/* ── Items preview (mobile-friendly) ── */}
                  {order.items?.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {order.items.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover border border-black-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-black-100 flex items-center justify-center flex-shrink-0">
                              <Package size={12} className="text-black-300" />
                            </div>
                          )}
                          <p className="text-xs text-black-600 truncate flex-1">{item.name}</p>
                          <p className="text-xs font-semibold text-black-700 flex-shrink-0">
                            ×{item.quantity}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-[11px] text-black-400 pl-10">
                          +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Bottom row ── */}
                  <div className="mt-3 pt-3 border-t border-black-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-black-400 font-medium uppercase tracking-wide">
                        Total
                      </p>
                      <p className="font-bold text-primary-500 text-base leading-tight">
                        ৳{Number(order.totalPrice).toLocaleString('en-US')}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                      className="flex items-center gap-1.5 text-xs font-bold text-black-500 hover:text-primary-500 border border-black-200 hover:border-primary-300 bg-black-100/50 hover:bg-primary-50 px-3 py-2 rounded-xl transition-all"
                    >
                      View Details <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
