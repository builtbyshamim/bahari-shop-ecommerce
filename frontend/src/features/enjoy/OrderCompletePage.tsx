'use client';

import { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  Clock,
  ShoppingBag,
  Download,
  Share2,
  RotateCcw,
  Headphones,
  ArrowRight,
  Sparkles,
  Mail,
  User,
  CreditCard,
  Tag,
  ChevronRight,
  Copy,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetCompanyInfoQuery } from '@/redux/api/companyApi';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id?: string;
  name: string;
  image?: string;
  salePrice: number;
  quantity: number;
  lineTotal?: number;
  selectedVariantOptions?: Record<string, string>;
}

interface OrderAddress {
  fullName: string;
  phone: string;
  email?: string;
  fullAddress: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryMethodName?: string;
  deliveryCharge: number;
  subTotal: number;
  discount: number;
  couponDiscount: number;
  couponCode?: string;
  totalPrice: number;
  orderNote?: string;
  items: OrderItem[];
  address?: OrderAddress;
}

interface OrderCompletePageProps {
  order: Order;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => Number(n).toLocaleString('en-BD');
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });
const estimatedDelivery = (iso: string) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' });
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
const Confetti = () => {
  const [particles] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 96 + 2,
      size: [6, 8, 10, 5, 7][i % 5],
      color: ['#ff6600', '#ff8533', '#ffb380', '#ffd1b3', '#ff4500', '#ffa64d'][i % 6],
      shape: ['rounded-full', 'rounded-sm', 'rounded-none'][i % 3],
      duration: 1.4 + (i % 5) * 0.3,
      delay: (i * 0.1).toFixed(2),
    })),
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            left: `${p.x}%`,
            top: -12,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.85,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s both`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.9; }
          100% { transform: translateY(260px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes check-pop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.12) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-check  { animation: check-pop 0.6s cubic-bezier(.34,1.56,.64,1) 0.2s both; }
        .anim-ring::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 9999px;
          border: 2px solid #ff6600;
          opacity: 0;
          animation: pulse-ring 2.2s ease-out 0.7s infinite;
        }
        .slide-up-1 { animation: slide-up 0.55s ease both 0.05s; }
        .slide-up-2 { animation: slide-up 0.55s ease both 0.15s; }
        .slide-up-3 { animation: slide-up 0.55s ease both 0.25s; }
        .slide-up-4 { animation: slide-up 0.55s ease both 0.35s; }
        .slide-up-5 { animation: slide-up 0.55s ease both 0.45s; }
        .slide-up-6 { animation: slide-up 0.55s ease both 0.55s; }
        .slide-up-7 { animation: slide-up 0.55s ease both 0.65s; }
      `}</style>
    </div>
  );
};

// ─── Progress Tracker ─────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'pending', label: 'Placed', Icon: Sparkles },
  { key: 'confirmed', label: 'Confirmed', Icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', Icon: Package },
  { key: 'delivered', label: 'Delivered', Icon: Truck },
];

const Tracker = ({ status }: { status: string }) => {
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
                  ${
                    done
                      ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-200/50'
                      : 'bg-white border-black-200'
                  } ${active ? 'scale-110' : ''}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <Icon size={16} className={done ? 'text-white' : 'text-black-300'} />
              </div>
              <span
                className={`text-[10px] font-bold text-center leading-tight tracking-wide
                ${done ? 'text-primary-600' : 'text-black-400'}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Invoice Generator ────────────────────────────────────────────────────────
const generateInvoiceHTML = (order: Order, company: any = {}): string => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice – ${order.orderNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a1a; font-size: 13px; }
  .page { max-width: 720px; margin: 0 auto; padding: 40px 36px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 2px solid #ff6600; }
  .brand { font-size: 26px; font-weight: 900; color: #ff6600; letter-spacing: -0.5px; }
  .brand span { color: #1a1a1a; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 20px; font-weight: 700; color: #ff6600; }
  .invoice-meta p { color: #666; margin-top: 4px; font-size: 12px; }

  /* Status badge */
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #fff7ed; color: #ff6600; border: 1px solid #ffcfa0; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 28px 0; }
  .info-block h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
  .info-block p { font-size: 13px; color: #1a1a1a; margin-bottom: 3px; font-weight: 500; }
  .info-block p.sub { color: #666; font-weight: 400; font-size: 12px; }

  /* Items table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
  thead th { background: #fff7ed; color: #ff6600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; }
  thead th:last-child { text-align: right; }
  tbody td { padding: 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
  tbody td:last-child { text-align: right; font-weight: 700; color: #1a1a1a; }
  .item-name { font-weight: 600; color: #1a1a1a; margin-bottom: 3px; }
  .item-variant { font-size: 11px; color: #999; }

  /* Totals */
  .totals { margin-top: 0; border-top: 2px solid #ff6600; }
  .totals-inner { display: flex; justify-content: flex-end; }
  .totals-table { width: 280px; }
  .totals-table td { padding: 8px 12px; font-size: 13px; }
  .totals-table td:last-child { text-align: right; font-weight: 600; }
  .total-row td { background: #fff7ed; font-size: 16px; font-weight: 800; color: #ff6600; border-top: 1px solid #ffcfa0; padding: 12px; }
  .discount-val { color: #16a34a; }

  /* Footer */
  .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 11px; color: #999; }
  .thank-you { text-align: center; margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #fff7ed, #ffedd5); border-radius: 12px; border: 1px dashed #ffb380; }
  .thank-you p { font-size: 14px; font-weight: 700; color: #ff6600; }
  .thank-you span { font-size: 12px; color: #888; font-weight: 400; }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div style="display:flex;align-items:flex-start;gap:14px;">
      ${company.logoUrl ? `<img src="${company.logoUrl}" alt="${company.name || ''}" style="width:52px;height:52px;object-fit:contain;border-radius:10px;border:1px solid #f0f0f0;" />` : ''}
      <div>
        <div class="brand">${company.name || 'Invoice'}</div>
        ${company.tagline ? `<p style="color:#999;font-size:11px;font-style:italic;margin-top:2px;">${company.tagline}</p>` : ''}
        ${company.address ? `<p style="color:#999;font-size:12px;margin-top:4px;">${company.address}</p>` : ''}
        ${[company.email, company.phone, company.website].filter(Boolean).length > 0 ? `<p style="color:#999;font-size:12px;margin-top:2px;">${[company.email, company.phone, company.website].filter(Boolean).join(' · ')}</p>` : ''}
      </div>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>${order.orderNumber}</strong></p>
      <p>${fmtDate(order.createdAt)}</p>
      <p style="margin-top:6px;"><span class="badge">${order.status.toUpperCase()}</span></p>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div class="info-block">
      <h4>Bill To</h4>
      ${
        order.address
          ? `
        <p>${order.address.fullName}</p>
        <p class="sub">${order.address.phone}</p>
        ${order.address.email ? `<p class="sub">${order.address.email}</p>` : ''}
        <p class="sub">${order.address.fullAddress}</p>
      `
          : '<p class="sub">—</p>'
      }
    </div>
    <div class="info-block" style="text-align:right;">
      <h4>Payment Info</h4>
      <p>${order.paymentMethod}</p>
      <p class="sub" style="text-transform:capitalize;">${order.paymentStatus}</p>
      ${order.deliveryMethodName ? `<p class="sub">${order.deliveryMethodName}</p>` : ''}
      ${order.couponCode ? `<p class="sub">Coupon: ${order.couponCode}</p>` : ''}
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (item, i) => `
        <tr>
          <td style="color:#999;">${i + 1}</td>
          <td>
            <div class="item-name">${item.name}</div>
            ${
              item.selectedVariantOptions
                ? `<div class="item-variant">${Object.entries(item.selectedVariantOptions)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')}</div>`
                : ''
            }
          </td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">৳${fmt(item.salePrice)}</td>
          <td>৳${fmt(item.lineTotal ?? item.salePrice * item.quantity)}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-inner">
      <table class="totals-table">
        <tr><td style="color:#666;">Subtotal</td><td>৳${fmt(order.subTotal)}</td></tr>
        ${order.discount > 0 ? `<tr><td style="color:#16a34a;">Discount</td><td class="discount-val">−৳${fmt(order.discount)}</td></tr>` : ''}
        ${order.couponDiscount > 0 ? `<tr><td style="color:#16a34a;">Coupon</td><td class="discount-val">−৳${fmt(order.couponDiscount)}</td></tr>` : ''}
        <tr><td style="color:#666;">Delivery</td><td>${order.deliveryCharge === 0 ? '<span style="color:#16a34a;">FREE</span>' : `৳${fmt(order.deliveryCharge)}`}</td></tr>
        <tr class="total-row"><td>Total</td><td>৳${fmt(order.totalPrice)}</td></tr>
      </table>
    </div>
  </div>

  ${
    order.orderNote
      ? `
  <div style="margin-top:20px;padding:12px 16px;background:#f9f9f9;border-left:3px solid #ff6600;border-radius:4px;">
    <p style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Order Note</p>
    <p style="color:#444;font-size:13px;">${order.orderNote}</p>
  </div>`
      : ''
  }

  <!-- Thank You -->
  <div class="thank-you">
    <p>🎉 Thank you for your order!</p>
    <span>We appreciate your business. If you have any questions, contact our support.</span>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <p style="color:#ff6600;font-weight:600;">${order.orderNumber}</p>
  </div>
</div>
</body>
</html>
`;

const downloadInvoice = (order: Order, company: any = {}) => {
  const html = generateInvoiceHTML(order, company);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-${order.orderNumber}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Info Card ────────────────────────────────────────────────────────────────
const InfoCard = ({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl border border-black-200 overflow-hidden shadow-sm ${className}`}
  >
    <div className="px-5 py-3.5 border-b border-black-100 bg-black-100/30">
      <p className="text-[11px] font-bold text-black-400 uppercase tracking-widest">{title}</p>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

// ─── Price Row ────────────────────────────────────────────────────────────────
const PriceRow = ({
  label,
  value,
  highlight = false,
  green = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  green?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className={`text-sm ${highlight ? 'font-bold text-black-900' : 'text-black-500'}`}>
      {label}
    </span>
    <span
      className={`text-sm font-bold ${highlight ? 'text-primary-500 text-lg' : green ? 'text-green-600' : 'text-black-700'}`}
    >
      {value}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderCompletePage({ order }: OrderCompletePageProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: companyRes } = useGetCompanyInfoQuery();
  const company = companyRes?.data ?? {};

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setTimeout(() => {
      downloadInvoice(order, company);
      setDownloading(false);
    }, 400);
  };

  const isCancelledOrRefunded = order.status === 'cancelled' || order.status === 'refunded';
  const totalSaved = (order.discount ?? 0) + (order.couponDiscount ?? 0);

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.9; }
          100% { transform: translateY(260px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes check-pop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.12) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-check  { animation: check-pop 0.6s cubic-bezier(.34,1.56,.64,1) 0.2s both; }
        .anim-ring { position: relative; }
        .anim-ring::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 9999px;
          border: 2px solid #ff6600;
          opacity: 0;
          animation: pulse-ring 2.2s ease-out 0.7s infinite;
        }
        .su1 { animation: slide-up 0.55s ease both 0.05s; opacity:0; }
        .su2 { animation: slide-up 0.55s ease both 0.15s; opacity:0; }
        .su3 { animation: slide-up 0.55s ease both 0.25s; opacity:0; }
        .su4 { animation: slide-up 0.55s ease both 0.35s; opacity:0; }
        .su5 { animation: slide-up 0.55s ease both 0.45s; opacity:0; }
        .su6 { animation: slide-up 0.55s ease both 0.55s; opacity:0; }
        .su7 { animation: slide-up 0.55s ease both 0.65s; opacity:0; }
      `}</style>

      <div className="min-h-screen bg-black-100/60 py-8 md:py-14 px-4">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          {/* ── 1. Hero Card ── */}
          <div className="su1 relative bg-white rounded-3xl overflow-hidden shadow-xl shadow-primary-100/40">
            <Confetti />

            {/* Gradient band */}
            <div className="h-36 bg-gradient-to-br from-primary-500 via-primary-400 to-orange-400 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -left-8 w-52 h-52 rounded-full bg-white/8" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10">
                <p className="text-white/75 text-[11px] font-semibold tracking-widest uppercase">
                  Order Confirmed
                </p>
                <div className="flex items-center gap-2 justify-center mt-1.5">
                  <p className="text-white font-mono font-bold text-lg tracking-wider">
                    {order.orderNumber}
                  </p>
                  <button
                    onClick={copyOrderNumber}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Floating check */}
            <div className="relative flex justify-center -mt-11 mb-4 z-20">
              <div className="anim-ring">
                <div className="anim-check w-[84px] h-[84px] rounded-full bg-white shadow-xl shadow-primary-200/60 flex items-center justify-center border-4 border-white">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-orange-400 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-7 text-center flex flex-col items-center gap-2">
              <h1 className="text-2xl font-extrabold text-black-900 tracking-tight">
                {order.address?.fullName
                  ? `Thank you, ${order.address.fullName.split(' ')[0]}! 🎉`
                  : 'Order Placed! 🎉'}
              </h1>
              <p className="text-sm text-black-500 max-w-xs leading-relaxed">
                Your order has been placed successfully. We'll notify you once it's confirmed.
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-black-400">
                <Clock size={12} />
                <span>
                  {fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* ── 2. Progress Tracker ── */}
          {!isCancelledOrRefunded && (
            <div className="su2 bg-white rounded-2xl border border-black-200 px-5 py-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-black-800">Order Progress</h3>
                <span className="text-[10px] font-bold text-primary-600 bg-primary-100 border border-primary-200 rounded-full px-3 py-1 uppercase tracking-wide">
                  {order.status}
                </span>
              </div>
              <Tracker status={order.status} />
              <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-primary-50 to-orange-50 border border-primary-200 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Truck size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-black-700">Estimated Delivery</p>
                  <p className="text-xs text-primary-600 font-semibold">
                    {estimatedDelivery(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── 3. Items ── */}
          <InfoCard title={`Items Ordered (${order.items?.length ?? 0})`} className="su3">
            <div className="flex flex-col divide-y divide-black-100 -mx-5 px-0">
              {order.items?.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="flex items-center gap-3 px-5 py-3.5 first:pt-0 last:pb-0 hover:bg-black-100/30 transition-colors"
                >
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
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-black-400 mt-0.5">
                      ৳{fmt(item.salePrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-black-900 flex-shrink-0">
                    ৳{fmt(item.lineTotal ?? item.salePrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="-mx-5 mt-4 border-t border-black-100 bg-black-100/30 px-5 py-4 flex flex-col gap-2.5">
              <PriceRow label="Subtotal" value={`৳${fmt(order.subTotal)}`} />
              {order.discount > 0 && (
                <PriceRow label="Discount" value={`−৳${fmt(order.discount)}`} green />
              )}
              {order.couponDiscount > 0 && (
                <PriceRow
                  label={`Coupon${order.couponCode ? ` (${order.couponCode})` : ''}`}
                  value={`−৳${fmt(order.couponDiscount)}`}
                  green
                />
              )}
              <PriceRow
                label="Delivery"
                value={order.deliveryCharge === 0 ? 'FREE' : `৳${fmt(order.deliveryCharge)}`}
                green={order.deliveryCharge === 0}
              />
              <div className="border-t border-dashed border-black-300 pt-2.5">
                <PriceRow label="Total Paid" value={`৳${fmt(order.totalPrice)}`} highlight />
              </div>
              {totalSaved > 0 && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mt-1">
                  <span className="text-base">🎊</span>
                  <p className="text-[11px] text-green-700 font-bold">
                    You saved ৳{fmt(totalSaved)} on this order!
                  </p>
                </div>
              )}
            </div>
          </InfoCard>

          {/* ── 4. Payment & Delivery ── */}
          <div className="su4 grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-black-200 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-black-400 uppercase tracking-widest mb-3">
                Payment
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-black-400" />
                  <span className="text-xs font-bold text-black-800 capitalize">
                    {order.paymentMethod}
                  </span>
                </div>
                <span
                  className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize
                  ${
                    order.paymentStatus === 'paid'
                      ? 'text-green-700 bg-green-50 border-green-200'
                      : 'text-red-600 bg-red-50 border-red-200'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-black-200 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-black-400 uppercase tracking-widest mb-3">
                Delivery
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-black-400" />
                  <span className="text-xs font-bold text-black-800">
                    {order.deliveryMethodName ?? 'Standard'}
                  </span>
                </div>
                {order.couponCode && (
                  <div className="flex items-center gap-1.5">
                    <Tag size={12} className="text-primary-400" />
                    <span className="text-[11px] text-primary-600 font-bold">
                      {order.couponCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 5. Shipping Address ── */}
          {order.address && (
            <InfoCard title="Shipping Address" className="su5">
              <div className="flex flex-col gap-2.5 text-sm text-black-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black-100 flex items-center justify-center flex-shrink-0">
                    <User size={13} className="text-black-500" />
                  </div>
                  <span className="font-semibold">{order.address.fullName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black-100 flex items-center justify-center flex-shrink-0">
                    <Phone size={13} className="text-black-500" />
                  </div>
                  <span>{order.address.phone}</span>
                </div>
                {order.address.email && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-black-100 flex items-center justify-center flex-shrink-0">
                      <Mail size={13} className="text-black-500" />
                    </div>
                    <span className="text-black-500">{order.address.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={13} className="text-black-500" />
                  </div>
                  <span className="leading-relaxed">{order.address.fullAddress}</span>
                </div>
              </div>
            </InfoCard>
          )}

          {/* ── 6. Order Note ── */}
          {order.orderNote && (
            <InfoCard title="Order Note" className="su5">
              <p className="text-sm text-black-600 leading-relaxed">{order.orderNote}</p>
            </InfoCard>
          )}

          {/* ── 7. Actions ── */}
          <div className="su6 grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-primary-300 bg-primary-50 text-sm font-bold text-primary-600 hover:bg-primary-100 hover:shadow-md hover:shadow-primary-100/50 active:scale-95 transition-all disabled:opacity-60"
            >
              <Download size={15} />
              {downloading ? 'Preparing…' : 'Download Invoice'}
            </button>
            <button
              onClick={() => router.push(`/account/orders/${order.id}`)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-black-200 bg-white text-sm font-bold text-black-600 hover:border-black-300 hover:bg-black-100/50 active:scale-95 transition-all"
            >
              <Package size={15} /> View Order
            </button>
          </div>

          {/* ── 8. Support cards ── */}
          <div className="su6 grid grid-cols-2 gap-3">
            {[
              {
                Icon: RotateCcw,
                title: 'Easy Returns',
                sub: '7-day return policy',
                color: 'from-orange-50 to-primary-50',
              },
              {
                Icon: Headphones,
                title: '24/7 Support',
                sub: "We're here to help",
                color: 'from-blue-50 to-indigo-50',
              },
            ].map(({ Icon, title, sub, color }) => (
              <div
                key={title}
                className={`flex flex-col gap-2.5 bg-gradient-to-br ${color} border border-black-200 rounded-2xl px-4 py-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer`}
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-black-200">
                  <Icon size={16} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-black-800">{title}</p>
                  <p className="text-[11px] text-black-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 9. CTA ── */}
          <div className="su7">
            <Link href="/">
              <button className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-500 to-orange-400 hover:from-primary-600 hover:to-primary-500 active:scale-[.98] text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-primary-300/40 hover:shadow-primary-300/60">
                Continue Shopping
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={14} />
                </span>
              </button>
            </Link>
            <p className="text-center text-[11px] text-black-400 mt-3">
              Need help?{' '}
              <span className="text-primary-500 font-semibold cursor-pointer hover:underline">
                Contact Support
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
