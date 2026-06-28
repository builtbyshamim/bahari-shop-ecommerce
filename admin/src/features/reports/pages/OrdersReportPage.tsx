import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdArrowBack,
  MdShoppingCart,
  MdAttachMoney,
  MdDiscount,
  MdLocalShipping,
} from 'react-icons/md';
import { useGetOrdersReportQuery } from '../adminReportsApi';
import ReportDateFilter, {
  type Period,
  getDateRange,
  dateLabel,
} from '../components/ReportDateFilter';
import ReportKpiCard from '../components/ReportKpiCard';
import ReportExportBar from '../components/ReportExportBar';
import { exportOrdersExcel } from '../utils/exportExcel';
import { exportOrdersPdf } from '../utils/exportPdf';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-orange-100 text-orange-700',
};

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrdersReportPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const range = getDateRange(period, customStart, customEnd);
  const label = dateLabel(period, customStart, customEnd);

  const params = {
    ...range,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data, isFetching } = useGetOrdersReportQuery(params);
  const summary = data?.data?.summary;
  const rows = data?.data?.rows ?? [];

  const canExport = !isFetching && rows.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/reports"
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition"
        >
          <MdArrowBack className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full order details with revenue breakdown</p>
        </div>
      </div>

      {/* Date Filter */}
      <ReportDateFilter
        period={period}
        setPeriod={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        setCustomStart={setCustomStart}
        setCustomEnd={setCustomEnd}
      />

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            !statusFilter ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Status
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            className={`px-3 py-1 rounded-full text-xs capitalize font-medium transition ${
              statusFilter === s
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <ReportKpiCard
            label="Total Orders"
            value={summary.totalOrders ?? 0}
            icon={<MdShoppingCart />}
            color="orange"
          />
          <ReportKpiCard
            label="Total Revenue"
            value={`৳${Number(summary.totalRevenue ?? 0).toLocaleString()}`}
            icon={<MdAttachMoney />}
            color="green"
          />
          <ReportKpiCard
            label="Total Discount"
            value={`৳${Number(summary.totalDiscount ?? 0).toLocaleString()}`}
            icon={<MdDiscount />}
            color="red"
          />
          <ReportKpiCard
            label="Avg Order Value"
            value={`৳${Number(summary.avgOrderValue ?? 0).toFixed(0)}`}
            icon={<MdLocalShipping />}
            color="blue"
          />
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="mb-4">
          <ReportExportBar
            onExcelExport={() => canExport && exportOrdersExcel(data?.data, label)}
            onPdfExport={() => canExport && exportOrdersPdf(data?.data, label)}
            disabled={!canExport}
            rowCount={rows.length}
          />
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="table-section w-full">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  {[
                    'Order No',
                    'Customer',
                    'Phone',
                    'Items',
                    'Sub Total',
                    'Discount',
                    'Delivery',
                    'Total',
                    'Payment',
                    'Status',
                    'Created By',
                    'Date',
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              {isFetching ? (
                <tbody>
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                </tbody>
              ) : rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-gray-400">
                      No orders found for the selected period.
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="table-body">
                  {rows.map((r: any, i: number) => (
                    <tr key={r.id ?? i}>
                      <td className="font-mono font-semibold text-orange-600">{r.orderNumber}</td>
                      <td>{r.customer}</td>
                      <td>{r.phone}</td>
                      <td className="text-center">{r.items}</td>
                      <td>৳{Number(r.subTotal).toLocaleString()}</td>
                      <td className="text-red-500">-৳{Number(r.discount).toLocaleString()}</td>
                      <td>৳{Number(r.deliveryCharge).toLocaleString()}</td>
                      <td className="font-bold">৳{Number(r.totalPrice).toLocaleString()}</td>
                      <td>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>{r.createdBy || '—'}</td>
                      <td>{new Date(r.date).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
