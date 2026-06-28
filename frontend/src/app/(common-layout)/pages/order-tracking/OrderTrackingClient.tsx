'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useLazyTrackOrderByNumberQuery } from '@/redux/api/orderApi';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; Icon: React.ElementType }
> = {
  pending:   { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-50',  border: 'border-yellow-200', Icon: Clock },
  confirmed: { label: 'Confirmed',  color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   Icon: CheckCircle2 },
  processing:{ label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', Icon: Package },
  shipped:   { label: 'Shipped',    color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200', Icon: Truck },
  delivered: { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200',  Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',    Icon: AlertCircle },
  refunded:  { label: 'Refunded',   color: 'text-gray-700',   bg: 'bg-gray-50',    border: 'border-gray-200',   Icon: AlertCircle },
};

const STATUS_STEPS = [
  { key: 'pending',   label: 'Placed',     Icon: Sparkles },
  { key: 'confirmed', label: 'Confirmed',  Icon: CheckCircle2 },
  { key: 'shipped',   label: 'Shipped',    Icon: Package },
  { key: 'delivered', label: 'Delivered',  Icon: Truck },
];

const fmt = (n: number) => Number(n).toLocaleString('en-BD');
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

function ProgressTracker({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  const progress = currentIdx <= 0 ? 0 : (currentIdx / (STATUS_STEPS.length - 1)) * 100;

  return (
    <div className="relative px-2 pt-1 pb-3">
      <div className="absolute top-[22px] left-8 right-8 h-[2px] bg-black-200 rounded-full" />
      <div
        className="absolute top-[22px] left-8 h-[2px] bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-1000"
        style={{ width: `calc(${progress}% * (100% - 64px) / 100)`, maxWidth: 'calc(100% - 64px)' }}
      />
      <div className="relative flex justify-between">
        {STATUS_STEPS.map(({ key, label, Icon }, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={key} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${done ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-200/50' : 'bg-white border-black-200'}
                  ${active ? 'scale-110' : ''}`}
              >
                <Icon size={16} className={done ? 'text-white' : 'text-black-300'} />
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight tracking-wide ${done ? 'text-primary-600' : 'text-black-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [searched, setSearched] = useState('');

  const [trigger, { data, isLoading, isError, isFetching }] = useLazyTrackOrderByNumberQuery();

  const order = data?.data;
  const statusCfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending']) : null;
  const isCancelled = order?.status === 'cancelled' || order?.status === 'refunded';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    if (!trimmed) return;
    setSearched(trimmed);
    trigger(trimmed);
  };

  return (
    <div className="min-h-[70vh] bg-black-100/40 py-10 px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-400 shadow-lg shadow-primary-200/50 mb-4">
            <Search size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-black-900 tracking-tight">Order Tracking</h1>
          <p className="text-sm text-black-500 mt-1.5">Enter your invoice / order number to track your order</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-black-200 shadow-sm p-5 flex flex-col gap-3">
          <label className="text-xs font-bold text-black-600 uppercase tracking-widest">
            Invoice / Order Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. ORD-20250510-ABCD1234"
              className="flex-1 text-sm border border-black-200 rounded-xl px-4 py-3 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-black-300 font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || isFetching || !input.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-orange-400 text-white text-sm font-bold hover:from-primary-600 hover:to-primary-500 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-primary-200/40"
            >
              {isLoading || isFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Track
            </button>
          </div>
        </form>

        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 size={22} className="animate-spin text-primary-400" />
            <p className="text-sm text-black-500 font-medium">Searching for your order…</p>
          </div>
        )}

        {/* Error */}
        {isError && searched && !isLoading && !isFetching && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle size={22} className="text-red-400" />
            </div>
            <p className="text-sm font-bold text-black-700">Order not found</p>
            <p className="text-xs text-black-400 max-w-xs">
              No order found with invoice number <span className="font-bold text-black-600">{searched}</span>. Please check and try again.
            </p>
          </div>
        )}

        {/* Result Card */}
        {order && !isLoading && !isFetching && (
          <div
            onClick={() => router.push(`/enjoy/thanks-massage/${order.id}`)}
            className="bg-white rounded-2xl border border-black-200 shadow-sm overflow-hidden cursor-pointer hover:border-primary-300 hover:shadow-md hover:shadow-primary-100/40 transition-all active:scale-[.99] group"
          >
            {/* Card Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-primary-50 to-orange-50 border-b border-black-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-black-400 uppercase tracking-widest mb-1">Invoice</p>
                <p className="text-base font-mono font-bold text-black-900">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {statusCfg && (
                  <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                    <statusCfg.Icon size={12} />
                    {statusCfg.label}
                  </span>
                )}
                <ChevronRight size={18} className="text-black-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Progress Tracker */}
            {!isCancelled && (
              <div className="px-5 pt-5 pb-2">
                <p className="text-[10px] font-bold text-black-400 uppercase tracking-widest mb-4">Order Progress</p>
                <ProgressTracker status={order.status} />
              </div>
            )}

            {/* Order Info */}
            <div className="px-5 py-4 flex flex-col gap-3">
              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-black-500">
                <Clock size={13} className="text-black-400" />
                <span>Placed on {fmtDate(order.createdAt)}</span>
              </div>

              {/* Items */}
              <div className="flex items-start gap-2 text-xs text-black-600">
                <ShoppingBag size={13} className="text-black-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">
                  {order.items?.slice(0, 2).map((it: any) => it.name).join(', ')}
                  {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ''}
                </span>
              </div>

              {/* Address */}
              {order.address && (
                <div className="flex items-center gap-2 text-xs text-black-500">
                  <MapPin size={13} className="text-black-400 flex-shrink-0" />
                  <span className="truncate">{order.address.fullAddress}</span>
                </div>
              )}

              {/* Payment */}
              <div className="flex items-center gap-2 text-xs text-black-500">
                <CreditCard size={13} className="text-black-400" />
                <span className="capitalize">{order.paymentMethod ?? 'N/A'}</span>
                <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize
                  ${order.paymentStatus === 'paid' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                  {order.paymentStatus}
                </span>
              </div>

              {/* Coupon */}
              {order.couponCode && (
                <div className="flex items-center gap-2 text-xs text-primary-600">
                  <Tag size={13} className="text-primary-400" />
                  <span className="font-bold">{order.couponCode}</span>
                  <span className="text-green-600">−৳{fmt(order.couponDiscount)}</span>
                </div>
              )}
            </div>

            {/* Total Footer */}
            <div className="px-5 py-4 border-t border-black-100 bg-black-100/30 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-bold text-black-400 uppercase tracking-widest">Total Paid</p>
                <p className="text-lg font-extrabold text-primary-500">৳{fmt(order.totalPrice)}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 border border-primary-200 px-4 py-2 rounded-xl group-hover:bg-primary-100 transition-colors">
                View Details <ChevronRight size={14} />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
