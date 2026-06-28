'use client';

import { useGetOrderByIdQuery } from '@/redux/api/orderApi';
import { useGetCompanyInfoQuery } from '@/redux/api/companyApi';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const fmt = (n: number) => Number(n).toLocaleString('en-BD');

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function OrderInvoice({ id }: { id: string }) {
  const { data: orderRes, isLoading: orderLoading } = useGetOrderByIdQuery(id);
  const { data: companyRes, isLoading: companyLoading } = useGetCompanyInfoQuery();

  const order: any = orderRes?.data;
  const company: any = companyRes?.data ?? {};

  const isLoading = orderLoading || companyLoading;

  const contactParts = [company.email, company.phone, company.website].filter(Boolean);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: '#ff6600' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f5f5f5', color: '#666' }}>
        <p style={{ fontSize: 14 }}>Order not found.</p>
        <Link href="/account/orders" style={{ fontSize: 12, color: '#ff6600' }}>← Back to orders</Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
        }
        @page { margin: 18mm 14mm; size: A4; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '32px 16px', fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, color: '#1a1a1a' }}>

        {/* Toolbar */}
        <div className="no-print" style={{ maxWidth: 760, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href={`/account/orders/${id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#555', textDecoration: 'none' }}
          >
            <ArrowLeft size={15} /> Back to Order
          </Link>
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ff6600', color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
          >
            <Printer size={15} />
            Print Invoice
          </button>
        </div>

        {/* Invoice card */}
        <div
          className="invoice-page"
          style={{ maxWidth: 760, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '36px 36px 28px', borderBottom: '2px solid #ff6600' }}>
            {/* Company */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              {company.logoUrl && (
                <img
                  src={company.logoUrl}
                  alt={company.name || ''}
                  style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 10, border: '1px solid #f0f0f0' }}
                />
              )}
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#ff6600', letterSpacing: '-0.5px' }}>
                  {company.name || 'Invoice'}
                </div>
                {company.tagline && (
                  <p style={{ color: '#999', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}>{company.tagline}</p>
                )}
                {company.address && (
                  <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{company.address}</p>
                )}
                {contactParts.length > 0 && (
                  <p style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{contactParts.join(' · ')}</p>
                )}
              </div>
            </div>

            {/* Invoice meta */}
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ff6600' }}>INVOICE</h2>
              <p style={{ color: '#666', marginTop: 4, fontSize: 12 }}><strong>{order.orderNumber}</strong></p>
              <p style={{ color: '#666', fontSize: 12 }}>{fmtDate(order.createdAt)}</p>
              <p style={{ marginTop: 6 }}>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: '#fff7ed', color: '#ff6600', border: '1px solid #ffcfa0' }}>
                  {order.status}
                </span>
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '24px 36px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 8 }}>Bill To</h4>
              {order.address ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{order.address.fullName}</p>
                  <p style={{ color: '#666', fontSize: 12, marginBottom: 3 }}>{order.address.phone}</p>
                  {order.address.email && <p style={{ color: '#666', fontSize: 12, marginBottom: 3 }}>{order.address.email}</p>}
                  <p style={{ color: '#666', fontSize: 12 }}>{order.address.fullAddress}</p>
                </>
              ) : (
                <p style={{ color: '#666' }}>—</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 8 }}>Payment Info</h4>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, textTransform: 'capitalize' }}>{order.paymentMethod ?? '—'}</p>
              <p style={{ color: '#666', fontSize: 12, marginBottom: 3, textTransform: 'capitalize' }}>{order.paymentStatus}</p>
              {order.deliveryMethodName && <p style={{ color: '#666', fontSize: 12, marginBottom: 3 }}>{order.deliveryMethodName}</p>}
              {order.couponCode && <p style={{ color: '#666', fontSize: 12 }}>Coupon: {order.couponCode}</p>}
            </div>
          </div>

          {/* Items table */}
          <div style={{ padding: '24px 36px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Item', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        background: '#fff7ed',
                        color: '#ff6600',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '10px 12px',
                        textAlign: i === 0 || i === 1 ? 'left' : i === 2 ? 'center' : 'right',
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, i: number) => (
                  <tr key={item.id ?? i}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', color: '#999', verticalAlign: 'top' }}>{i + 1}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 3 }}>{item.name}</div>
                      {item.selectedVariantOptions && (
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {Object.entries(item.selectedVariantOptions).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', verticalAlign: 'top' }}>৳{fmt(Number(item.salePrice))}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 700, verticalAlign: 'top' }}>৳{fmt(Number(item.lineTotal ?? item.salePrice * item.quantity))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ borderTop: '2px solid #ff6600', padding: '0 36px 24px', display: 'flex', justifyContent: 'flex-end' }}>
            <table style={{ width: 280 }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', color: '#666' }}>Subtotal</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>৳{fmt(Number(order.subTotal))}</td>
                </tr>
                {Number(order.discount) > 0 && (
                  <tr>
                    <td style={{ padding: '8px 12px', color: '#16a34a' }}>Discount</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>−৳{fmt(Number(order.discount))}</td>
                  </tr>
                )}
                {Number(order.couponDiscount) > 0 && (
                  <tr>
                    <td style={{ padding: '8px 12px', color: '#16a34a' }}>
                      Coupon{order.couponCode ? ` (${order.couponCode})` : ''}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>−৳{fmt(Number(order.couponDiscount))}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '8px 12px', color: '#666' }}>Delivery</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                    {Number(order.deliveryCharge) === 0
                      ? <span style={{ color: '#16a34a' }}>FREE</span>
                      : `৳${fmt(Number(order.deliveryCharge))}`}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', background: '#fff7ed', fontSize: 16, fontWeight: 800, color: '#ff6600', borderTop: '1px solid #ffcfa0' }}>Total</td>
                  <td style={{ padding: '12px', background: '#fff7ed', fontSize: 16, fontWeight: 800, color: '#ff6600', borderTop: '1px solid #ffcfa0', textAlign: 'right' }}>৳{fmt(Number(order.totalPrice))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Order note */}
          {order.orderNote && (
            <div style={{ padding: '0 36px 20px' }}>
              <div style={{ padding: '12px 16px', background: '#f9f9f9', borderLeft: '3px solid #ff6600', borderRadius: 4 }}>
                <p style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Order Note</p>
                <p style={{ color: '#444', fontSize: 13 }}>{order.orderNote}</p>
              </div>
            </div>
          )}

          {/* Thank you */}
          <div style={{ margin: '0 36px 24px', padding: 16, background: 'linear-gradient(135deg,#fff7ed,#ffedd5)', borderRadius: 12, border: '1px dashed #ffb380', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#ff6600' }}>🎉 Thank you for your order!</p>
            <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>We appreciate your business. If you have any questions, contact our support.</span>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, color: '#999' }}>
              Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <p style={{ fontSize: 11, color: '#ff6600', fontWeight: 600 }}>{order.orderNumber}</p>
          </div>
        </div>
      </div>
    </>
  );
}
