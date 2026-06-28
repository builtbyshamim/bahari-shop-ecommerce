import moment from 'moment';

export type Period = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface Props {
  period: Period;
  setPeriod: (p: Period) => void;
  customStart: string;
  customEnd: string;
  setCustomStart: (v: string) => void;
  setCustomEnd: (v: string) => void;
}

export function getDateRange(period: Period, customStart: string, customEnd: string): DateRange {
  const fmt = 'YYYY-MM-DD';
  switch (period) {
    case 'today':
      return { startDate: moment().format(fmt), endDate: moment().format(fmt) };
    case 'week':
      return {
        startDate: moment().startOf('isoWeek').format(fmt),
        endDate: moment().endOf('isoWeek').format(fmt),
      };
    case 'month':
      return {
        startDate: moment().startOf('month').format(fmt),
        endDate: moment().endOf('month').format(fmt),
      };
    case 'year':
      return {
        startDate: moment().startOf('year').format(fmt),
        endDate: moment().endOf('year').format(fmt),
      };
    case 'custom':
      return { startDate: customStart || undefined, endDate: customEnd || undefined };
    default:
      return {};
  }
}

const PRESETS: { label: string; value: Period }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

export function dateLabel(period: Period, customStart: string, customEnd: string): string {
  switch (period) {
    case 'today':
      return `Today (${moment().format('DD MMM YYYY')})`;
    case 'week':
      return `${moment().startOf('isoWeek').format('DD MMM')} – ${moment().endOf('isoWeek').format('DD MMM YYYY')}`;
    case 'month':
      return moment().format('MMMM YYYY');
    case 'year':
      return moment().format('YYYY');
    case 'custom':
      return customStart && customEnd
        ? `${moment(customStart).format('DD MMM YYYY')} – ${moment(customEnd).format('DD MMM YYYY')}`
        : 'Custom Range';
    default:
      return 'All Time';
  }
}

export default function ReportDateFilter({
  period,
  setPeriod,
  customStart,
  customEnd,
  setCustomStart,
  setCustomEnd,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
      <div className="flex flex-wrap gap-2 items-center">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              period === p.value
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            {p.label}
          </button>
        ))}

        {period === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        )}
      </div>
    </div>
  );
}
