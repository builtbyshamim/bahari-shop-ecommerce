import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} from '../OrdersApi';
import {
  useGetPaymentsByOrderIdQuery,
  useCreateOrderPaymentMutation,
} from '../order-payments/orderPaymentApi';
import { useGetAllAccountsQuery } from '../../accounting/accounts/accountApi';
import { useGetCompanyInfoQuery } from '../../settings/company-info/companyApi';
import { OrderStatus } from '../../../types/order-type';
import toast from 'react-hot-toast';
import AssignCourierSection from './AssignCourierSection';

const orderStatusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const paymentStatusColor: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  refunded: 'bg-gray-100 text-gray-700',
};

// ── only these statuses can be assigned to courier ─────────────────────────
const COURIER_ASSIGNABLE_STATUSES: string[] = ['confirmed', 'processing'];

const Badge = ({ label, colorClass }: { label: string; colorClass: string }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
    {label}
  </span>
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value ?? '—'}</span>
  </div>
);

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetOrderByIdQuery(id!);
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [createOrderPayment, { isLoading: recordingPayment }] = useCreateOrderPaymentMutation();
  const { data: paymentsData } = useGetPaymentsByOrderIdQuery(id!, { skip: !id });
  const { data: accountsData } = useGetAllAccountsQuery({ limit: 100 });
  const { data: companyData } = useGetCompanyInfoQuery(undefined);

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');

  const order = data?.data;
  const accounts = accountsData?.data?.data?.data ?? [];
  const company = companyData?.data ?? {};
  const totalPaid = paymentsData?.totalPaid ?? 0;
  const due = paymentsData?.due ?? 0;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !id) return;
    try {
      await updateStatus({ id, status: selectedStatus as OrderStatus }).unwrap();
      setSelectedStatus('');
      toast.success('Order status updated successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update order status.');
    }
  };

  const handleRecordPayment = async () => {
    if (!id || !paymentAmount || Number(paymentAmount) <= 0) return;
    try {
      await createOrderPayment({
        orderId: id,
        amount: Number(paymentAmount),
        accountId: paymentAccountId || undefined,
        paidAt: paymentDate,
        note: paymentNote || undefined,
      }).unwrap();
      setPaymentAmount('');
      setPaymentNote('');
      toast.success('Payment recorded and ledger credited!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to record payment.');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(id).unwrap();
      toast.success('Order cancelled successfully!');
    } catch (error) {
      toast.error('Failed to cancel order.');
    }
  };

  const handlePrintInvoice = () => {
    const companyName    = company.name    || 'Your Shop';
    const companyPhone   = company.phone   || '';
    const companyEmail   = company.email   || '';
    const companyAddress = company.address || '';
    const companyTagline = company.tagline || '';
    const companyWebsite = company.website || '';
    const companyLogo    = company.logoUrl || '';

    const contactLine = [companyEmail, companyPhone, companyWebsite]
      .filter(Boolean)
      .join(' | ');

    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice - ${order.orderNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .company-block { display: flex; align-items: flex-start; gap: 14px; }
        .company-logo { width: 56px; height: 56px; object-fit: contain; border-radius: 6px; }
        .company-name { font-size: 22px; font-weight: 700; color: #111; }
        .company-tagline { font-size: 11px; color: #888; margin-top: 2px; font-style: italic; }
        .company-sub { font-size: 11px; color: #555; margin-top: 5px; line-height: 1.6; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 26px; font-weight: 800; color: #111; letter-spacing: 2px; }
        .invoice-title p { font-size: 12px; color: #555; margin-top: 4px; }
        .divider { border: none; border-top: 1.5px solid #e5e7eb; margin: 20px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
        .info-block h4 { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .info-block p { font-size: 13px; color: #222; line-height: 1.7; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: #f3f4f6; }
        th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #555; text-transform: uppercase; }
        td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #222; }
        .totals { margin-left: auto; width: 260px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #444; }
        .totals-row.total { border-top: 2px solid #111; margin-top: 8px; padding-top: 10px; font-size: 15px; font-weight: 700; color: #111; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; }
        @media print { body { padding: 24px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-block">
          ${companyLogo ? `<img src="${companyLogo}" class="company-logo" alt="logo" />` : ''}
          <div>
            <div class="company-name">${companyName}</div>
            ${companyTagline ? `<div class="company-tagline">${companyTagline}</div>` : ''}
            <div class="company-sub">
              ${companyAddress ? `${companyAddress}<br/>` : ''}
              ${contactLine}
            </div>
          </div>
        </div>
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p>${order.orderNumber}</p>
          <p>${new Date(order.createdAt).toLocaleString('en-GB')}</p>
        </div>
      </div>
      <hr class="divider" />
      <div class="info-grid">
        <div class="info-block">
          <h4>Bill To</h4>
          <p><strong>${order.customer?.name ?? '—'}</strong></p>
          <p>${order.customer?.phone ?? ''}</p>
          <p>${order.customer?.email || ''}</p>
          <p>${order.address?.address ?? order.customer?.address ?? ''}</p>
        </div>
        <div class="info-block">
          <h4>Order Info</h4>
          <p><strong>Order No:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod ?? '—'}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr><th>#</th><th>Item</th><th>Variant</th><th style="text-align:right">Unit Price</th><th style="text-align:center">Qty</th><th style="text-align:right">Total</th></tr>
        </thead>
        <tbody>
          ${order.items
            ?.map(
              (item: any, i: number) => `
            <tr>
              <td>${i + 1}</td><td>${item.name}</td>
              <td>${
                item.selectedVariantOptions
                  ? Object.entries(item.selectedVariantOptions)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')
                  : '—'
              }</td>
              <td style="text-align:right">৳${Number(item.salePrice).toFixed(2)}</td>
              <td style="text-align:center">${item.quantity}</td>
              <td style="text-align:right">৳${Number(item.lineTotal).toFixed(2)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-row"><span>Sub Total</span><span>৳${Number(order.subTotal).toFixed(2)}</span></div>
        ${Number(order.discount) > 0 ? `<div class="totals-row"><span>Discount</span><span>-৳${Number(order.discount).toFixed(2)}</span></div>` : ''}
        ${Number(order.couponDiscount) > 0 ? `<div class="totals-row"><span>Coupon (${order.couponCode ?? ''})</span><span>-৳${Number(order.couponDiscount).toFixed(2)}</span></div>` : ''}
        <div class="totals-row"><span>Delivery</span><span>৳${Number(order.deliveryCharge).toFixed(2)}</span></div>
        <div class="totals-row total"><span>Total</span><span>৳${Number(order.totalPrice).toFixed(2)}</span></div>
      </div>
      ${order.orderNote ? `<p style="margin-top:24px;font-size:12px;color:#555"><strong>Note:</strong> ${order.orderNote}</p>` : ''}
      <div class="footer">
        Thank you for your order! &nbsp;|&nbsp; ${companyName}
        ${companyWebsite ? `&nbsp;|&nbsp; ${companyWebsite}` : ''}
      </div>
    </body>
    </html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">Loading order...</div>
    );
  if (isError || !order)
    return (
      <div className="flex items-center justify-center h-64 text-red-500">Order not found.</div>
    );

  const isCancellable = !['shipped', 'delivered', 'cancelled'].includes(order.status);
  const isCourierAssignable = COURIER_ASSIGNABLE_STATUSES.includes(order.status);

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date(order.createdAt).toLocaleString('en-GB')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge label={order.status} colorClass={orderStatusColor[order.status] ?? ''} />
          <Badge
            label={order.paymentStatus}
            colorClass={paymentStatusColor[order.paymentStatus] ?? ''}
          />
          {isCancellable && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          <button onClick={handlePrintInvoice} className="btn text-sm">
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Customer Info">
          <InfoRow label="Name" value={order.customer?.name} />
          <InfoRow
            label="Phone"
            value={
              <div className="flex items-center gap-2">
                <span>{order.customer?.phone}</span>
                {order.customer?.phone && (
                  <button
                    onClick={() =>
                      navigate(`/admin/courier-services/fraud-check?phone=${order.customer.phone}`)
                    }
                    className="text-[11px] px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition font-medium"
                  >
                    Fraud Check
                  </button>
                )}
              </div>
            }
          />
          <InfoRow label="Email" value={order.customer?.email || '—'} />
          <InfoRow label="Address" value={order.customer?.address} />
        </Card>
        <Card title="Order Summary">
          <InfoRow label="Sub Total" value={`৳${Number(order.subTotal).toFixed(2)}`} />
          <InfoRow label="Discount" value={`৳${Number(order.discount).toFixed(2)}`} />
          <InfoRow label="Coupon Discount" value={`৳${Number(order.couponDiscount).toFixed(2)}`} />
          {order.couponCode && <InfoRow label="Coupon Code" value={order.couponCode} />}
          <InfoRow label="Delivery Charge" value={`৳${Number(order.deliveryCharge).toFixed(2)}`} />
          {order.deliveryMethodName && (
            <InfoRow label="Delivery Method" value={order.deliveryMethodName} />
          )}
          <InfoRow
            label="Payment Status"
            value={
              <Badge
                label={order.paymentStatus}
                colorClass={paymentStatusColor[order.paymentStatus] ?? ''}
              />
            }
          />
          <InfoRow
            label="Total"
            value={
              <span className="text-base font-bold text-gray-900">
                ৳{Number(order.totalPrice).toFixed(2)}
              </span>
            }
          />
          <InfoRow
            label="Paid"
            value={
              <span className="text-sm font-semibold text-green-700">৳{totalPaid.toFixed(2)}</span>
            }
          />
          {due > 0 && (
            <InfoRow
              label="Due"
              value={<span className="text-sm font-semibold text-red-600">৳{due.toFixed(2)}</span>}
            />
          )}
          <InfoRow label="Payment Method" value={order.paymentMethod ?? '—'} />
          <InfoRow
            label="Order Source"
            value={
              order.orderSource?.name ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                  {order.orderSource.name}
                </span>
              ) : (
                '—'
              )
            }
          />
          {order.orderNote && <InfoRow label="Order Note" value={order.orderNote} />}
        </Card>
      </div>

      {/* Order Items */}
      <Card title={`Order Items (${order.items?.length ?? 0})`}>
        <div className="max-w-full overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="table-row">
                <th>#</th>
                <th>IMAGE</th>
                <th>NAME</th>
                <th>VARIANT</th>
                <th>UNIT PRICE</th>
                <th>QTY</th>
                <th>LINE TOTAL</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {order.items?.map((item: any, index: number) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="text-wrap">{item.name}</span>
                  </td>
                  <td>
                    {item.selectedVariantOptions ? (
                      <span className="text-xs text-gray-600">
                        {Object.entries(item.selectedVariantOptions)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>৳{Number(item.salePrice).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td className="font-semibold">৳{Number(item.lineTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Marketing / UTM Tracking ─────────────────────────────── */}
      {(order.utmSource ||
        order.utmMedium ||
        order.utmCampaign ||
        order.clickId ||
        order.fbp ||
        order.fbc) && (
        <Card title="Marketing Tracking">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {order.utmSource && <InfoRow label="UTM Source" value={order.utmSource} />}
            {order.utmMedium && <InfoRow label="UTM Medium" value={order.utmMedium} />}
            {order.utmCampaign && <InfoRow label="UTM Campaign" value={order.utmCampaign} />}
            {order.utmContent && <InfoRow label="UTM Content" value={order.utmContent} />}
            {order.utmTerm && <InfoRow label="UTM Term" value={order.utmTerm} />}
            {order.clickId && (
              <InfoRow
                label="Click ID (fbclid/gclid)"
                value={<span className="font-mono text-xs break-all">{order.clickId}</span>}
              />
            )}
            {order.fbp && (
              <InfoRow
                label="Facebook Browser ID (_fbp)"
                value={<span className="font-mono text-xs break-all">{order.fbp}</span>}
              />
            )}
            {order.fbc && (
              <InfoRow
                label="Facebook Click ID (_fbc)"
                value={<span className="font-mono text-xs break-all">{order.fbc}</span>}
              />
            )}
          </div>
        </Card>
      )}

      {/* ── Courier Assign — only when status is confirmed / processing ── */}
      {isCourierAssignable && <AssignCourierSection order={order} />}

      {/* Status Update */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Update Order Status">
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="search-input flex-1"
            >
              <option value="">Select status</option>
              {Object.values(OrderStatus).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || updatingStatus}
              className="btn"
            >
              {updatingStatus ? 'Updating...' : 'Update'}
            </button>
          </div>
        </Card>

        <Card title="Record Payment">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={`Amount (due: ৳${due.toFixed(2)})`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="search-input w-full"
                />
              </div>
              <div className="flex-1">
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="search-input w-full"
                >
                  <option value="">Select account</option>
                  {accounts.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="search-input flex-1"
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="search-input flex-1"
              />
            </div>
            <button
              onClick={handleRecordPayment}
              disabled={!paymentAmount || Number(paymentAmount) <= 0 || recordingPayment}
              className="btn w-full"
            >
              {recordingPayment ? 'Recording...' : 'Record & Credit Ledger'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails;
