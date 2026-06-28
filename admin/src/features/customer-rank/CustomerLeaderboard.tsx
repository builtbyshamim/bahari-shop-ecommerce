import { useState } from 'react';
import { FiSearch, FiRefreshCw, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  useGetLeaderboardQuery,
  useGetAllLevelsQuery,
  useRecalculateRanksMutation,
} from './customerRankApi';
import { useDebounce } from '../../hooks/useDebounce';
import { ErrorState } from '../../components/ui/status/ErrorState';
import { EmptyState } from '../../components/ui/status/EmptyState';
import CommonPagination from '../../components/ui/pagination/CommonPagination';

const BADGE_COLORS: Record<string, string> = {
  Platinum: 'bg-purple-100 text-purple-700',
  Gold: 'bg-amber-100 text-amber-700',
  Silver: 'bg-gray-100 text-gray-600',
  Bronze: 'bg-orange-100 text-orange-700',
};

const RANK_COLORS: Record<number, string> = {
  1: 'text-amber-500 font-bold',
  2: 'text-gray-400 font-semibold',
  3: 'text-orange-500 font-semibold',
};

const PROGRESS_COLORS: Record<string, string> = {
  Platinum: 'bg-purple-500',
  Gold: 'bg-amber-400',
  Silver: 'bg-gray-400',
  Bronze: 'bg-orange-400',
};
function getInitials(name: string): string {
  return (name || '??')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function fmtAmount(amount: number): string {
  return '৳ ' + Number(amount).toLocaleString('en-IN');
}

// const StatCard = ({
//   label,
//   value,
//   sub,
// }: {
//   label: string;
//   value: string | number;
//   sub?: string;
// }) => (
//   <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//     <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
//     <p className="text-2xl font-bold text-gray-800">{value}</p>
//     {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
//   </div>
// );
const CustomerLeaderboard = () => {
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
    levelId: '',
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const {
    data: lbData,
    isFetching,
    error,
    refetch,
  } = useGetLeaderboardQuery({
    page: searchValue.page,
    limit: searchValue.limit,
    levelId: searchValue.levelId || undefined,
  });

  const { data: levelsData } = useGetAllLevelsQuery({});
  const [recalculate, { isLoading: isRecalculating }] = useRecalculateRanksMutation();
  console.log('Leaderboard Data:', lbData);

  const allRanks: any[] = lbData?.data?.data || [];
  const meta = lbData?.data?.meta || { totalItems: 0, totalPages: 1 };
  const levels: any[] = levelsData?.data || [];

  // Client-side name/email filter
  const filtered = debouncedSearch
    ? allRanks.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          r.user?.email?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : allRanks;

  const handleRecalculate = async () => {
    try {
      const result = await recalculate({}).unwrap();
      toast.success(result?.message || 'Ranks recalculated!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to recalculate.');
    }
  };

  const globalOffset = (searchValue.page - 1) * searchValue.limit;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <FiAward className="text-amber-500 text-xl" />
            <h1 className="text-2xl font-bold text-gray-800">Customer Leaderboard</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">Customers ranked by total purchase spend</p>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={isRecalculating || isFetching}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <FiRefreshCw className={`text-base ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalculating...' : 'Recalculate All Ranks'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input pl-9"
            disabled={isFetching}
          />
        </div>

        <select
          value={searchValue.levelId}
          onChange={(e) => setSearchValue({ ...searchValue, levelId: e.target.value, page: 1 })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          disabled={isFetching}
        >
          <option value="">All Levels</option>
          {levels.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.badge} {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState
          message={(error as any)?.data?.message || 'Failed to fetch leaderboard'}
          refetch={refetch}
        />
      ) : (
        <div className="table-container">
          <div className="max-w-full overflow-x-auto">
            {filtered.length === 0 && !isFetching ? (
              <EmptyState message="No customers found" />
            ) : (
              <>
                <div className="table-section w-full">
                  <table className="table w-full">
                    <thead>
                      <tr className="table-row">
                        <th className="w-14">RANK</th>
                        <th>CUSTOMER</th>
                        <th>LEVEL</th>
                        <th className="text-right">TOTAL SPENT</th>
                        <th className="text-right">DISCOUNT</th>
                        <th>PROGRESS</th>
                        <th>LAST EVALUATED</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filtered.map((rank: any, index: number) => {
                        const globalRank = globalOffset + index + 1;
                        const levelName: string = rank.level?.name || 'Bronze';
                        const badgeClass = BADGE_COLORS[levelName] || 'bg-gray-100 text-gray-600';
                        const rankClass = RANK_COLORS[globalRank] || 'text-gray-500';
                        const progressColor = PROGRESS_COLORS[levelName] || 'bg-gray-400';

                        const minAmt = Number(rank.level?.minAmount ?? 0);
                        const maxAmt = Number(rank.level?.maxAmount ?? 100000000);
                        const spent = Number(rank.totalSpent ?? 0);
                        const levelRange = maxAmt - minAmt;
                        const progressPct =
                          levelRange > 0
                            ? Math.min(100, Math.round(((spent - minAmt) / levelRange) * 100))
                            : 100;

                        const evaluatedAt = rank.lastEvaluatedAt
                          ? new Date(rank.lastEvaluatedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—';

                        return (
                          <tr key={rank.id || rank.userId}>
                            <td>
                              <span className={`text-sm ${rankClass}`}>
                                {globalRank === 1
                                  ? '🥇'
                                  : globalRank === 2
                                    ? '🥈'
                                    : globalRank === 3
                                      ? '🥉'
                                      : `#${globalRank}`}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                  {getInitials(rank.user?.name || '')}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">
                                    {rank.user?.name || 'Unknown'}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {rank.user?.email || rank.userId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}
                              >
                                <span className="text-sm">{rank.level?.badge}</span>
                                {levelName}
                              </span>
                            </td>
                            <td className="text-right font-medium text-gray-800 text-sm tabular-nums">
                              {fmtAmount(rank.totalSpent)}
                            </td>
                            <td className="text-right">
                              {Number(rank.level?.discountPercent ?? 0) > 0 ? (
                                <span className="text-xs font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                  {rank.level.discountPercent}% off
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                            <td>
                              <div className="w-28">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                  <span>{progressPct}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${progressColor} transition-all`}
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="text-gray-400 text-xs">{evaluatedAt}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {meta.totalItems > searchValue.limit && (
                  <CommonPagination
                    total={meta.totalItems}
                    totalPage={meta.totalPages}
                    setSearchValue={setSearchValue}
                    searchValue={searchValue}
                    refetch={refetch}
                    limit={searchValue.limit}
                    page={searchValue.page}
                    disabled={isFetching}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLeaderboard;
