import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack, MdTrendingDown, MdCategory, MdReceipt } from 'react-icons/md';
import { useGetTransactionsReportQuery } from '../adminReportsApi';
import ReportDateFilter, {
  type Period,
  getDateRange,
  dateLabel,
} from '../components/ReportDateFilter';
import ReportKpiCard from '../components/ReportKpiCard';
import ReportExportBar from '../components/ReportExportBar';
import { exportTransactionsExcel } from '../utils/exportExcel';
import { exportTransactionsPdf } from '../utils/exportPdf';

export default function ExpenseReportPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const range = getDateRange(period, customStart, customEnd);
  const label = dateLabel(period, customStart, customEnd);

  const { data, isFetching } = useGetTransactionsReportQuery({ ...range, type: 'expense' });
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
          <h1 className="text-2xl font-bold text-gray-800">Expense Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All expense transactions with category breakdown
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

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <ReportKpiCard
            label="Total Expense"
            value={`৳${Number(summary.totalExpense ?? 0).toLocaleString()}`}
            icon={<MdTrendingDown />}
            color="red"
          />
          <ReportKpiCard
            label="Transactions"
            value={summary.count ?? 0}
            icon={<MdReceipt />}
            color="blue"
          />
          <ReportKpiCard
            label="Categories"
            value={summary.byCategoryExpense?.length ?? 0}
            icon={<MdCategory />}
            color="orange"
          />
        </div>
      )}

      {/* Category Breakdown */}
      {summary?.byCategoryExpense?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Expense by Category</h3>
          <div className="space-y-2">
            {summary.byCategoryExpense.map((c: any) => {
              const pct =
                summary.totalExpense > 0 ? ((c.total / summary.totalExpense) * 100).toFixed(1) : 0;
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{c.category}</span>
                    <span className="font-semibold">
                      ৳{Number(c.total).toLocaleString()}{' '}
                      <span className="text-gray-400 font-normal text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="mb-4">
          <ReportExportBar
            onExcelExport={() => canExport && exportTransactionsExcel(data?.data, label, 'expense')}
            onPdfExport={() => canExport && exportTransactionsPdf(data?.data, label, 'expense')}
            disabled={!canExport}
            rowCount={rows.length}
          />
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="table-section w-full">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  {['Date', 'Category', 'Account', 'Amount (৳)', 'Note', 'Recorded By'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>

              {isFetching ? (
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                </tbody>
              ) : rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No expense transactions found.
                    </td>
                  </tr>
                </tbody>
              ) : (
                <>
                  <tbody className="table-body">
                    {rows.map((r: any, i: number) => (
                      <tr key={r.id ?? i}>
                        <td>{new Date(r.date).toLocaleDateString('en-GB')}</td>
                        <td>{r.category}</td>
                        <td>{r.account}</td>
                        <td className="font-semibold text-red-600">
                          ৳{Number(r.amount).toLocaleString()}
                        </td>
                        <td className="max-w-xs truncate">{r.note || '—'}</td>
                        <td>{r.recordedBy || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-red-50">
                    <tr>
                      <td colSpan={3} className="px-2 py-2 font-semibold text-sm">
                        Total
                      </td>
                      <td className="px-2 py-2 font-bold text-red-700">
                        ৳
                        {rows
                          .reduce((sum: number, r: any) => sum + Number(r.amount), 0)
                          .toLocaleString()}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
