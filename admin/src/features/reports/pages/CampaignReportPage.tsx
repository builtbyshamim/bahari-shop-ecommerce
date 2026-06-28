import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack, MdBarChart, MdAttachMoney, MdCampaign, MdSource } from 'react-icons/md';
import { useGetCampaignReportQuery } from '../adminReportsApi';
import ReportDateFilter, {
  type Period,
  getDateRange,
  dateLabel,
} from '../components/ReportDateFilter';
import ReportKpiCard from '../components/ReportKpiCard';
import ReportExportBar from '../components/ReportExportBar';
import { exportCampaignExcel } from '../utils/exportExcel';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(n);

type SortKey = 'revenue' | 'orders' | 'avgOrderValue' | 'revenueShare';

export default function CampaignReportPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');

  const range = getDateRange(period, customStart, customEnd);
  const label = dateLabel(period, customStart, customEnd);

  const { data, isFetching } = useGetCampaignReportQuery(range);
  const summary = data?.data?.summary;
  const allRows: any[] = data?.data?.rows ?? [];

  const sources = useMemo(
    () => [...new Set(allRows.map((r: any) => r.utmSource))],
    [allRows],
  );

  const rows = useMemo(() => {
    const filtered = sourceFilter
      ? allRows.filter((r: any) => r.utmSource === sourceFilter)
      : allRows;
    return [...filtered].sort((a, b) => b[sortKey] - a[sortKey]);
  }, [allRows, sourceFilter, sortKey]);

  const canExport = !isFetching && rows.length > 0;

  // Top 8 for the mini bar chart
  const chartRows = rows.slice(0, 8);
  const maxRev = Math.max(...chartRows.map((r) => r.revenue), 1);

  const SortBtn = ({ k, label: l }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortKey(k)}
      className={`px-3 py-1 text-xs rounded-full font-medium transition ${
        sortKey === k
          ? 'bg-orange-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
      }`}
    >
      {l}
    </button>
  );

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
          <h1 className="text-2xl font-bold text-gray-800">Campaign Attribution</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Sales breakdown by UTM source, medium, and campaign
          </p>
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

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <ReportKpiCard
            label="Total Revenue"
            value={`৳${fmt(summary.totalRevenue ?? 0)}`}
            icon={<MdAttachMoney />}
            color="green"
          />
          <ReportKpiCard
            label="Total Orders"
            value={summary.totalOrders ?? 0}
            icon={<MdBarChart />}
            color="orange"
          />
          <ReportKpiCard
            label="Ad Sources"
            value={summary.uniqueSources ?? 0}
            icon={<MdSource />}
            color="blue"
            sub="Facebook, Google, etc."
          />
          <ReportKpiCard
            label="Campaigns Tracked"
            value={summary.uniqueCampaigns ?? 0}
            icon={<MdCampaign />}
            color="purple"
          />
        </div>
      )}

      {/* Mini bar chart */}
      {chartRows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Top Campaigns by Revenue
          </h3>
          <div className="flex items-end gap-2 h-32">
            {chartRows.map((r, i) => {
              const pct = Math.max((r.revenue / maxRev) * 100, r.revenue > 0 ? 4 : 0);
              const name =
                r.utmCampaign !== '—' ? r.utmCampaign : r.utmSource;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                    <div className="bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 whitespace-nowrap shadow-lg text-center">
                      <p className="font-semibold">{name}</p>
                      <p className="text-gray-300">{r.utmSource}</p>
                      <p>৳{fmt(r.revenue)}</p>
                      <p className="text-gray-300">{r.orders} orders</p>
                    </div>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
                  </div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-orange-500 to-orange-300 transition-all duration-500 cursor-pointer"
                    style={{ height: `${(pct / 100) * 112}px` }}
                  />
                  <span className="text-[9px] text-gray-400 text-center truncate w-full px-1 leading-tight">
                    {name.length > 10 ? name.slice(0, 10) + '…' : name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source filter pills */}
      {sources.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSourceFilter('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              !sourceFilter
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Sources
          </button>
          {sources.map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(sourceFilter === s ? '' : s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                sourceFilter === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ReportExportBar
            onExcelExport={() => canExport && exportCampaignExcel(data?.data, label)}
            onPdfExport={() => {}}
            disabled={!canExport}
            rowCount={rows.length}
          />
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Sort by:</span>
            <SortBtn k="revenue" label="Revenue" />
            <SortBtn k="orders" label="Orders" />
            <SortBtn k="avgOrderValue" label="Avg Order" />
          </div>
        </div>

        {isFetching ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No campaign data found for this period. Orders need UTM parameters to appear here.
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  <th className="text-left">#</th>
                  <th className="text-left">Source</th>
                  <th className="text-left">Medium</th>
                  <th className="text-left">Campaign</th>
                  <th className="text-right">Orders</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Avg Order</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Share %</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {rows.map((r: any, i: number) => (
                  <tr key={i}>
                    <td className="text-gray-400 text-xs">{i + 1}</td>
                    <td>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          r.utmSource === 'Direct'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {r.utmSource}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{r.utmMedium}</td>
                    <td className="text-sm font-medium text-gray-800">
                      {r.utmCampaign !== '—' ? r.utmCampaign : (
                        <span className="text-gray-400 text-xs italic">no campaign</span>
                      )}
                    </td>
                    <td className="text-right font-semibold">{r.orders}</td>
                    <td className="text-right font-bold text-gray-800">
                      ৳{fmt(r.revenue)}
                    </td>
                    <td className="text-right text-gray-600">
                      ৳{fmt(r.avgOrderValue)}
                    </td>
                    <td className="text-right">
                      <span className="text-green-700 font-medium">{r.paidOrders}</span>
                      <span className="text-gray-400 text-xs">
                        {' '}/ {r.orders}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-orange-400 rounded-full"
                            style={{ width: `${Math.min(r.revenueShare, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {r.revenueShare}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>How this works:</strong> Every order placed on the storefront captures the UTM parameters from the URL (
        <code className="text-xs bg-blue-100 px-1 rounded">utm_source</code>,{' '}
        <code className="text-xs bg-blue-100 px-1 rounded">utm_medium</code>,{' '}
        <code className="text-xs bg-blue-100 px-1 rounded">utm_campaign</code>). Orders without UTM parameters are grouped as "Direct".
        Tag your ad links like:{' '}
        <code className="text-xs bg-blue-100 px-1 rounded">
          yoursite.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=eid-sale
        </code>
      </div>
    </div>
  );
}
