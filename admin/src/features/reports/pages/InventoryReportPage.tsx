import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack, MdInventory, MdWarning, MdBlock, MdAttachMoney } from 'react-icons/md';
import { useGetInventoryReportQuery } from '../adminReportsApi';
import ReportKpiCard from '../components/ReportKpiCard';
import ReportExportBar from '../components/ReportExportBar';
import { exportInventoryExcel } from '../utils/exportExcel';
import { exportInventoryPdf } from '../utils/exportPdf';

const STATUS_COLORS: Record<string, string> = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

export default function InventoryReportPage() {
  const [search, setSearch] = useState('');

  const { data, isFetching } = useGetInventoryReportQuery();
  const summary = data?.data?.summary;
  const allRows: any[] = data?.data?.rows ?? [];
  const rows = allRows.filter(
    (r) =>
      !search ||
      r.product?.toLowerCase().includes(search.toLowerCase()) ||
      r.sku?.toLowerCase().includes(search.toLowerCase()),
  );
  const canExport = !isFetching && allRows.length > 0;

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
          <h1 className="text-2xl font-bold text-gray-800">Inventory Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Current stock levels, values, and status</p>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <ReportKpiCard
            label="Total Products"
            value={summary.totalProducts ?? 0}
            icon={<MdInventory />}
            color="blue"
          />
          <ReportKpiCard
            label="Stock Value"
            value={`৳${Number(summary.totalStockValue ?? 0).toLocaleString()}`}
            icon={<MdAttachMoney />}
            color="green"
          />
          <ReportKpiCard
            label="Low Stock Items"
            value={summary.lowStockItems ?? 0}
            icon={<MdWarning />}
            color="yellow"
          />
          <ReportKpiCard
            label="Out of Stock"
            value={summary.outOfStockItems ?? 0}
            icon={<MdBlock />}
            color="red"
          />
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <ReportExportBar
            onExcelExport={() => canExport && exportInventoryExcel(data?.data)}
            onPdfExport={() => canExport && exportInventoryPdf(data?.data)}
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
                    'Product',
                    'SKU',
                    'On Hand',
                    'Reserved',
                    'Available',
                    'Threshold',
                    'Avg Cost',
                    'Total Value',
                    'Status',
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              {isFetching ? (
                <tbody>
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                </tbody>
              ) : rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      No inventory records found.
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="table-body">
                  {rows.map((r: any, i: number) => (
                    <tr key={r.inventoryId ?? i}>
                      <td className="font-medium max-w-[200px] truncate">{r.product}</td>
                      <td className="font-mono">{r.sku}</td>
                      <td className="text-center font-semibold">{r.qtyOnHand}</td>
                      <td className="text-center text-orange-600">{r.qtyReserved}</td>
                      <td className="text-center font-bold text-blue-700">{r.qtyAvailable}</td>
                      <td className="text-center">{r.lowStockThreshold}</td>
                      <td>৳{Number(r.avgCostPrice).toFixed(2)}</td>
                      <td className="font-semibold">৳{Number(r.totalValue).toLocaleString()}</td>
                      <td>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {r.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
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
