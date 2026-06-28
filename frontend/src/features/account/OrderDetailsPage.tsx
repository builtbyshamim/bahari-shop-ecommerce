// app/account/orders/[id]/page.tsx
'use client';

import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  CreditCard,
  Tag,
  Loader2,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { useGetOrderByIdQuery } from '@/redux/api/orderApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import AccountLayout from '@/features/account/AccountLayout';

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<string, { label: string; style: string; icon: any; bg: string }> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    style: 'text-yellow-700 border-yellow-300',
    bg: 'bg-yellow-50',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    style: 'text-blue-700 border-blue-300',
    bg: 'bg-blue-50',
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    style: 'text-amber-700 border-amber-300',
    bg: 'bg-amber-50',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    style: 'text-indigo-700 border-indigo-300',
    bg: 'bg-indigo-50',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    style: 'text-green-700 border-green-300',
    bg: 'bg-green-50',
  },
  cancelled: { label: 'Cancelled', icon: X, style: 'text-red-600 border-red-300', bg: 'bg-red-50' },
  refunded: {
    label: 'Refunded',
    icon: RefreshCw,
    style: 'text-purple-700 border-purple-300',
    bg: 'bg-purple-50',
  },
};

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  unpaid: 'text-red-600 bg-red-50 border-red-200',
  paid: 'text-green-700 bg-green-50 border-green-200',
  partial: 'text-amber-700 bg-amber-50 border-amber-200',
  refunded: 'text-purple-700 bg-purple-50 border-purple-200',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ── Small reusable card ────────────────────────────────────────────────────
const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-black-200 p-4">
    <p className="text-[11px] font-bold text-black-400 uppercase tracking-wide mb-3">{title}</p>
    {children}
  </div>
);

export default function OrderDetailsPage({ id }: any) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetOrderByIdQuery(id, { skip: !id });
  const [copied, setCopied] = useState(false);
  const order: any = data?.data;
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order?.orderNumber ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <AccountLayout activeTab="orders">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={30} className="animate-spin text-primary-400" />
        </div>
      </AccountLayout>
    );
  }

  if (isError || !order) {
    return (
      <AccountLayout activeTab="orders">
        <div className="bg-white rounded-2xl border border-black-200 py-16 flex flex-col items-center gap-4">
          <X size={32} className="text-red-400" />
          <p className="text-sm text-black-500">Order not found</p>
          <button
            onClick={() => router.back()}
            className="text-xs font-bold text-primary-500 border border-primary-200 bg-primary-50 px-4 py-2 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </AccountLayout>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const SIcon = cfg.icon;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <AccountLayout activeTab="orders">
      <div className="flex flex-col gap-4 max-w-2xl">
        {/* ── Back + Header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border border-black-200 bg-white flex items-center justify-center hover:bg-black-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-black-600" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-black-800 font-mono">{order.orderNumber}</p>
              <button
                onClick={copyOrderNumber}
                className="text-black-400 hover:text-primary-500 transition-colors"
              >
                {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
            </div>
            <p className="text-xs text-black-400 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.style} ${cfg.bg}`}
            >
              <SIcon size={11} /> {cfg.label}
            </span>
            <Link
              href={`/invoice/${id}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Printer size={11} /> Invoice
            </Link>
          </div>
        </div>

        {/* ── Progress Tracker ── */}
        {!isCancelled && (
          <InfoCard title="Order Progress">
            <div className="flex items-center justify-between relative">
              {/* connector line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-black-200 z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary-500 z-0 transition-all duration-500"
                style={{
                  width:
                    currentStep <= 0 ? '0%' : `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                const StepIcon = STATUS_CONFIG[step]?.icon ?? Clock;
                return (
                  <div key={step} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${
                        done
                          ? 'bg-primary-500 border-primary-500 shadow-md shadow-primary-200/50'
                          : 'bg-white border-black-300'
                      } ${active ? 'scale-110' : ''}`}
                    >
                      <StepIcon size={13} className={done ? 'text-white' : 'text-black-300'} />
                    </div>
                    <span
                      className={`text-[10px] font-bold text-center capitalize leading-tight
                      ${done ? 'text-primary-600' : 'text-black-400'}`}
                    >
                      {step === 'shipped'
                        ? 'Shipped'
                        : step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </InfoCard>
        )}

        {/* ── Order Items ── */}
        <InfoCard title={`Items (${order.items?.length ?? 0})`}>
          <div className="flex flex-col divide-y divide-black-100">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-black-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-black-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-black-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black-800 truncate">{item.name}</p>
                  {item.selectedVariantOptions && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(item.selectedVariantOptions).map(([k, v]) => (
                        <span
                          key={k}
                          className="text-[10px] bg-black-100 text-black-600 px-2 py-0.5 rounded-full font-medium"
                        >
                          {k}: {v as string}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-black-400 mt-0.5">
                    ৳{Number(item.salePrice).toLocaleString('en-US')} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-black-800 flex-shrink-0">
                  ৳{Number(item.lineTotal).toLocaleString('en-US')}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* ── Price Summary ── */}
        <InfoCard title="Price Summary">
          <div className="flex flex-col gap-2">
            {[
              { label: 'Subtotal', value: order.subTotal },
              { label: 'Discount', value: -order.discount, hide: !order.discount },
              { label: 'Coupon', value: -order.couponDiscount, hide: !order.couponDiscount },
              { label: 'Delivery', value: order.deliveryCharge },
            ]
              .filter((r) => !r.hide)
              .map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-black-500">{row.label}</span>
                  <span
                    className={`text-xs font-semibold ${row.value < 0 ? 'text-green-600' : 'text-black-700'}`}
                  >
                    {row.value < 0 ? '-' : ''}৳{Math.abs(Number(row.value)).toLocaleString('en-US')}
                  </span>
                </div>
              ))}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-black-200">
              <span className="text-sm font-bold text-black-900">Total</span>
              <span className="text-base font-bold text-primary-500">
                ৳{Number(order.totalPrice).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </InfoCard>

        {/* ── Payment & Delivery ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard title="Payment">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-black-400" />
                <span className="text-xs text-black-700 font-semibold capitalize">
                  {order.paymentMethod ?? 'N/A'}
                </span>
              </div>
              <span
                className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize
                ${PAYMENT_STATUS_STYLE[order.paymentStatus] ?? PAYMENT_STATUS_STYLE.unpaid}`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </InfoCard>

          <InfoCard title="Delivery">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-black-400" />
                <span className="text-xs text-black-700 font-semibold">
                  {order.deliveryMethodName ?? 'Standard'}
                </span>
              </div>
              {order.couponCode && (
                <div className="flex items-center gap-1.5">
                  <Tag size={12} className="text-primary-400" />
                  <span className="text-[11px] text-primary-600 font-bold">{order.couponCode}</span>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        {/* ── Customer Info ── */}
        {order.address && (
          <InfoCard title="Shipping Address">
            <div className="flex flex-col gap-2 text-xs text-black-700">
              <div className="flex items-center gap-2">
                <User size={12} className="text-black-400" />
                {order.address.fullName}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={12} className="text-black-400" />
                {order.address.phone}
              </div>

              {order.address.email && (
                <div className="flex items-center gap-2">
                  <span className="text-black-400 text-[11px]">Email:</span>
                  {order.address.email}
                </div>
              )}

              <div className="flex items-start gap-2">
                <MapPin size={12} className="text-black-400 mt-0.5 flex-shrink-0" />
                <span>{order.address.fullAddress}</span>
              </div>
            </div>
          </InfoCard>
        )}

        {/* ── Order Note ── */}
        {order.orderNote && (
          <InfoCard title="Order Note">
            <p className="text-xs text-black-600 leading-relaxed">{order.orderNote}</p>
          </InfoCard>
        )}
      </div>
    </AccountLayout>
  );
}
