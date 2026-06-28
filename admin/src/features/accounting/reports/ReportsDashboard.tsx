import { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import {
  useGetReportSummaryQuery,
  useGetReportByCategoryQuery,
  useGetReportTimeSeriesQuery,
  useGetAccountBalancesQuery,
} from '../ledger/ledgerApi';

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) => (
  <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${color}`}>
    <div className="p-3 rounded-lg bg-current bg-opacity-10">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

const ReportsDashboard = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('month');

  const filterParams = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    account_id: undefined,
  };

  const { data: summaryData, error: summaryError } = useGetReportSummaryQuery(filterParams);

  const { data: categoryData } = useGetReportByCategoryQuery(filterParams);

  const { data: timeSeriesData } = useGetReportTimeSeriesQuery({
    ...filterParams,
    groupBy,
  });

  const { data: balancesData } = useGetAccountBalancesQuery(undefined);

  const summary = summaryData?.data?.data;
  const categories = categoryData?.data?.data || [];
  const timeSeries = timeSeriesData?.data?.data || [];
  const balances = balancesData?.data?.data || [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Income, expense, and profit overview</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'day' | 'month')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-sm text-red-500 hover:underline self-end pb-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryError ? (
          <div className="col-span-4">
            <ErrorState message="Failed to load summary" refetch={() => {}} />
          </div>
        ) : (
          <>
            <StatCard
              label="Total Income"
              value={`৳ ${Number(summary?.total_income ?? 0).toLocaleString()}`}
              icon={FiTrendingUp}
              color="border-green-200 text-green-600"
            />
            <StatCard
              label="Total Expense"
              value={`৳ ${Number(summary?.total_expense ?? 0).toLocaleString()}`}
              icon={FiTrendingDown}
              color="border-red-200 text-red-600"
            />
            <StatCard
              label="Profit / Loss"
              value={`৳ ${Number(summary?.profit_loss ?? 0).toLocaleString()}`}
              icon={FiDollarSign}
              color={
                (summary?.profit_loss ?? 0) >= 0
                  ? 'border-blue-200 text-blue-600'
                  : 'border-orange-200 text-orange-600'
              }
            />
            <StatCard
              label="Total Account Balance"
              value={`৳ ${Number(summary?.total_account_balance ?? 0).toLocaleString()}`}
              icon={FiCreditCard}
              color="border-purple-200 text-purple-600"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Balances */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Account Balances</h2>
          {balances.length === 0 ? (
            <p className="text-gray-400 text-sm">No accounts found</p>
          ) : (
            <div className="space-y-3">
              {balances.map((acc: any) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">{acc.account_name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {acc.account_type}
                      {acc.mobile_provider ? ` · ${acc.mobile_provider}` : ''}
                    </p>
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      acc.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ৳ {Number(acc.current_balance).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Category Breakdown</h2>
          {categories.length === 0 ? (
            <p className="text-gray-400 text-sm">No data for selected period</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat: any, i: number) => (
                <div
                  key={`${cat.category_id}-${i}`}
                  className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cat.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm text-gray-700">{cat.category_name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        cat.type === 'income'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      ৳ {Number(cat.total).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{cat.count} txns</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Time Series Table */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          {groupBy === 'month' ? 'Monthly' : 'Daily'} Income vs Expense
        </h2>
        {timeSeries.length === 0 ? (
          <p className="text-gray-400 text-sm">No data for selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-sm">
              <thead>
                <tr className="table-row">
                  <th>PERIOD</th>
                  <th className="text-right">INCOME</th>
                  <th className="text-right">EXPENSE</th>
                  <th className="text-right">NET</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {timeSeries.map((row: any, i: number) => (
                  <tr key={i}>
                    <td>
                      {new Date(row.period).toLocaleDateString('en-BD', {
                        year: 'numeric',
                        month: groupBy === 'month' ? 'long' : 'short',
                        day: groupBy === 'day' ? 'numeric' : undefined,
                      })}
                    </td>
                    <td className="text-right text-green-600 font-medium">
                      ৳ {Number(row.income).toLocaleString()}
                    </td>
                    <td className="text-right text-red-600 font-medium">
                      ৳ {Number(row.expense).toLocaleString()}
                    </td>
                    <td
                      className={`text-right font-semibold ${
                        row.net >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`}
                    >
                      {row.net >= 0 ? '+' : ''}৳ {Number(row.net).toLocaleString()}
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
};

export default ReportsDashboard;
