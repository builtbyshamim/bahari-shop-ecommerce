import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdArrowBack,
  MdSwapVert,
  MdArrowUpward,
  MdArrowDownward,
  MdAttachMoney,
} from 'react-icons/md';
import { useGetStockMovementsReportQuery } from '../adminReportsApi';
import ReportDateFilter, {
  type Period,
  getDateRange,
  dateLabel,
} from '../components/ReportDateFilter';
import ReportKpiCard from '../components/ReportKpiCard';
import ReportExportBar from '../components/ReportExportBar';
import { exportStockMovementsExcel } from '../utils/exportExcel';
import { exportStockMovementsPdf } from '../utils/exportPdf';

const MOVEMENT_TYPES = [
  { label: 'Purchase In', value: 'purchase_in' },
  { label: 'Sale Out', value: 'sale_out' },
  { label: 'Return In', value: 'return_in' },
  { label: 'Adj In', value: 'adjustment_in' },
  { label: 'Adj Out', value: 'adjustment_out' },
  { label: 'Transfer In', value: 'transfer_in' },
  { label: 'Transfer Out', value: 'transfer_out' },
  { label: 'Initial', value: 'initial' },
];

const TYPE_COLORS: Record<string, string> = {
  purchase_in: 'bg-green-100 text-green-700',
  sale_out: 'bg-blue-100 text-blue-700',
  return_in: 'bg-orange-100 text-orange-700',
  adjustment_in: 'bg-purple-100 text-purple-700',
  adjustment_out: 'bg-red-100 text-red-700',
  transfer_in: 'bg-cyan-100 text-cyan-700',
  transfer_out: 'bg-indigo-100 text-indigo-700',
  initial: 'bg-gray-100 text-gray-700',
};

export default function StockMovementsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [movementType, setMovementType] = useState('');

  const range = getDateRange(period, customStart, customEnd);
  const label = dateLabel(period, customStart, customEnd);

  const params = {
    ...range,
    ...(movementType ? { movementType } : {}),
  };

  const { data, isFetching } = useGetStockMovementsReportQuery(params);
  const summary = data?.data?.summary;
  const rows: any[] = data?.data?.rows ?? [];
  const canExport = !isFetching && rows.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/reports"
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition"
        >
          <MdArrowBack className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Movements</h1>
          <p className="text-sm text-gray-500 mt-0.5">All inventory movement history</p>
        </div>
      </div>

      <ReportDateFilter
        period={period}
        setPeriod={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        setCustomStart={setCustomStart}
        setCustomEnd={setCustomEnd}
      />

      {/* Movement Type Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setMovementType('')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            !movementType ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Types
        </button>
        {MOVEMENT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setMovementType(movementType === t.value ? '' : t.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              movementType === t.value
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <ReportKpiCard
            label="Total Movements"
            value={summary.total ?? 0}
            icon={<MdSwapVert />}
            color="blue"
          />
          <ReportKpiCard
            label="Stock In"
            value={summary.totalIn ?? 0}
            icon={<MdArrowUpward />}
            color="green"
          />
          <ReportKpiCard
            label="Stock Out"
            value={summary.totalOut ?? 0}
            icon={<MdArrowDownward />}
            color="red"
          />
          <ReportKpiCard
            label="Purchase Value"
            value={`৳${Number(summary.purchaseValue ?? 0).toLocaleString()}`}
            icon={<MdAttachMoney />}
            color="orange"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          <ReportExportBar
            onExcelExport={() => canExport && exportStockMovementsExcel(data?.data, label)}
            onPdfExport={() => canExport && exportStockMovementsPdf(data?.data, label)}
            disabled={!canExport}
            rowCount={rows.length}
          />
        </div>

        {isFetching ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No stock movements found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  {[
                    'Date',
                    'Product',
                    'SKU',
                    'Type',
                    'Qty',
                    'Before',
                    'After',
                    'Unit Cost',
                    'Total Value',
                    'Note',
                  ].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, i: number) => (
                  <tr key={r.id ?? i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(r.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-3 py-2 font-medium max-w-[150px] truncate">{r.product}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{r.sku}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[r.movementType] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.movementType}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2 font-bold text-center ${r.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {r.quantity > 0 ? '+' : ''}
                      {r.quantity}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-500">{r.qtyBefore}</td>
                    <td className="px-3 py-2 text-center font-semibold">{r.qtyAfter}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      ৳{Number(r.unitCostPrice).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-semibold">
                      ৳{Number(r.totalValue).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-gray-500 max-w-[120px] truncate">
                      {r.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
