import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdArrowBack,
  MdBarChart,
  MdTrendingUp,
  MdTrendingDown,
  MdShoppingBag,
  MdStar,
  MdAccountBalance,
  MdInventory,
} from 'react-icons/md';
import ReportDateFilter, { type Period, getDateRange } from '../components/ReportDateFilter';
import ReportKpiCard from '../components/ReportKpiCard';
import { useGetAdminSalesReportSummaryQuery } from '../adminReportsApi';

export default function SalesSummaryPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const range = getDateRange(period, customStart, customEnd);

  const { data, isFetching } = useGetAdminSalesReportSummaryQuery(range);
  console.log('Summary Data:', data);

  const sales = data?.data?.sales;
  const accounting = data?.data?.accounting;
  const inventory = data?.data?.inventory;

  const hasData = sales || accounting || inventory;

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
          <h1 className="text-2xl font-bold text-gray-800">Sales Summary</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Comprehensive overview: sales, accounting & inventory
          </p>
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

      {isFetching ? (
        <div className="p-12 text-center text-gray-400">Loading...</div>
      ) : hasData ? (
        <>
          {/* ── Sales Section ── */}
          {sales && (
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MdShoppingBag className="text-orange-500 text-base" /> Sales
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <ReportKpiCard
                  label="Total Revenue"
                  value={`৳${Number(sales.totalRevenue ?? 0).toLocaleString()}`}
                  icon={<MdTrendingUp />}
                  color="green"
                />
                <ReportKpiCard
                  label="Total Orders"
                  value={sales.totalOrders ?? 0}
                  icon={<MdShoppingBag />}
                  color="orange"
                />
                <ReportKpiCard
                  label="Avg Order Value"
                  value={`৳${Number(sales.avgOrderValue ?? 0).toFixed(0)}`}
                  icon={<MdBarChart />}
                  color="blue"
                />
                <ReportKpiCard
                  label="Total Items Sold"
                  value={sales.totalItems ?? 0}
                  icon={<MdStar />}
                  color="purple"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sales.byStatus?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Orders by Status</h3>
                    <div className="space-y-2">
                      {sales.byStatus.map(
                        (item: { status: string; count: number; revenue: number }) => (
                          <div key={item.status} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{item.status}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{item.count} orders</span>
                              <span className="text-sm font-semibold">
                                ৳{Number(item.revenue).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {sales.byPaymentMethod?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">By Payment Method</h3>
                    <div className="space-y-2">
                      {sales.byPaymentMethod.map(
                        (item: { method: string; count: number; revenue: number }) => (
                          <div key={item.method} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {item.method || 'Unknown'}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{item.count} orders</span>
                              <span className="text-sm font-semibold">
                                ৳{Number(item.revenue).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Accounting Section ── */}
          {accounting && (
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MdAccountBalance className="text-blue-500 text-base" /> Accounting
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <ReportKpiCard
                  label="Total Income"
                  value={`৳${Number(accounting.totalIncome ?? 0).toLocaleString()}`}
                  icon={<MdTrendingUp />}
                  color="green"
                />
                <ReportKpiCard
                  label="Total Expense"
                  value={`৳${Number(accounting.totalExpense ?? 0).toLocaleString()}`}
                  icon={<MdTrendingDown />}
                  color="red"
                />
                <ReportKpiCard
                  label="Net Profit"
                  value={`৳${Number(accounting.netProfit ?? 0).toLocaleString()}`}
                  icon={<MdBarChart />}
                  color={Number(accounting.netProfit ?? 0) >= 0 ? 'blue' : 'red'}
                />
                <ReportKpiCard
                  label="Transactions"
                  value={accounting.count ?? 0}
                  icon={<MdAccountBalance />}
                  color="orange"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {accounting.byCategoryIncome?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Income by Category</h3>
                    <div className="space-y-2">
                      {accounting.byCategoryIncome.map(
                        (item: { category: string; total: number }) => (
                          <div key={item.category} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{item.category}</span>
                            <span className="text-sm font-semibold text-green-600">
                              ৳{Number(item.total).toLocaleString()}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {accounting.byCategoryExpense?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Expense by Category
                    </h3>
                    <div className="space-y-2">
                      {accounting.byCategoryExpense.map(
                        (item: { category: string; total: number }) => (
                          <div key={item.category} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{item.category}</span>
                            <span className="text-sm font-semibold text-red-600">
                              ৳{Number(item.total).toLocaleString()}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Inventory Section ── */}
          {inventory && (
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MdInventory className="text-purple-500 text-base" /> Inventory
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportKpiCard
                  label="Total Products"
                  value={inventory.totalProducts ?? 0}
                  icon={<MdInventory />}
                  color="purple"
                />
                <ReportKpiCard
                  label="Total Stock Value"
                  value={`৳${Number(inventory.totalStockValue ?? 0).toLocaleString()}`}
                  icon={<MdBarChart />}
                  color="blue"
                />
                <ReportKpiCard
                  label="Low Stock Items"
                  value={inventory.lowStockItems ?? 0}
                  icon={<MdTrendingDown />}
                  color="yellow"
                />
                <ReportKpiCard
                  label="Out of Stock"
                  value={inventory.outOfStockItems ?? 0}
                  icon={<MdTrendingDown />}
                  color="red"
                />
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="p-12 text-center text-gray-400">No data available.</div>
      )}
    </div>
  );
}
