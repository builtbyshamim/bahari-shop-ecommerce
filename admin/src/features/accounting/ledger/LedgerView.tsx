import { useState } from 'react';
import { FiPrinter } from 'react-icons/fi';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import { useGetAllAccountsQuery } from '../accounts/accountApi';
import { useGetLedgerQuery } from './ledgerApi';

const LedgerView = () => {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: accountData } = useGetAllAccountsQuery({ limit: 100 });
  const accountOptions =
    accountData?.data?.data?.data?.map((a: any) => ({
      label: `${a.account_name}`,
      value: a.id,
    })) || [];

  const {
    data: ledgerData,
    isFetching,
    error,
    refetch,
  } = useGetLedgerQuery(
    { accountId: selectedAccountId, startDate, endDate },
    { skip: !selectedAccountId },
  );

  const ledger = ledgerData?.data?.data || null;
  console.log('Ledger Data:', ledgerData);
  console.log('Ledger ledger:', ledger);

  const handlePrint = () => window.print();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Account Ledger</h1>
          <p className="text-gray-600 mt-1">Running balance per account</p>
        </div>
        {ledger && (
          <button
            onClick={handlePrint}
            className="btn bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FiPrinter /> Print Ledger
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <div className="min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
          <SelectAndSearch
            name="account_id"
            label=""
            placeholder="Select an account"
            options={accountOptions}
            register={() => {}}
            setValue={() => {}}
            clearErrors={() => {}}
            trigger={() => {}}
            errors={{}}
            required={false}
            // Override: use onSelect pattern via setValue mock
            // Since SelectAndSearch uses setValue(name, value), we pass a custom one:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({
              setValue: (_name: string, value: string) => setSelectedAccountId(value),
            } as any)}
          />
        </div>

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

        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-sm text-red-500 hover:underline self-end pb-2"
          >
            Clear Dates
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {ledger && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Opening Balance</p>
            <p className="text-xl font-bold text-gray-700 mt-1">
              ৳ {ledger.opening_balance.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase tracking-wide">Total Income</p>
            <p className="text-xl font-bold text-green-700 mt-1">
              + ৳ {ledger.total_income.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide">Total Expense</p>
            <p className="text-xl font-bold text-red-700 mt-1">
              - ৳ {ledger.total_expense.toLocaleString()}
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              ledger.net >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
            }`}
          >
            <p className="text-xs text-blue-600 uppercase tracking-wide">Closing Balance</p>
            <p
              className={`text-xl font-bold mt-1 ${
                ledger.net >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}
            >
              ৳ {ledger.closing_balance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="table-container mt-6">
        {!selectedAccountId ? (
          <div className="py-16 text-center text-gray-400">
            👆 Please select an account to view its ledger
          </div>
        ) : error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch ledger'}
            refetch={refetch}
          />
        ) : ledger?.entries?.length === 0 && !isFetching ? (
          <EmptyState message="No transactions found for this account" actionText="" />
        ) : (
          <div className="max-w-full overflow-x-auto">
            <div className="table-section w-full">
              <table className="table w-full">
                <thead>
                  <tr className="table-row">
                    <th>#</th>
                    <th>DATE</th>
                    <th>CATEGORY</th>
                    <th>NOTE</th>
                    <th className="text-right">CREDIT (IN)</th>
                    <th className="text-right">DEBIT (OUT)</th>
                    <th className="text-right">BALANCE</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {/* Opening Balance Row */}
                  {ledger && (
                    <tr className="bg-blue-50 font-semibold">
                      <td>—</td>
                      <td colSpan={3} className="text-blue-700">
                        Opening Balance
                      </td>
                      <td></td>
                      <td></td>
                      <td className="text-right font-bold text-blue-700">
                        ৳ {ledger.opening_balance.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {/* Transaction Rows */}
                  {ledger?.entries?.map((entry: any, index: number) => (
                    <tr key={entry.id}>
                      <td>{index + 1}</td>
                      <td className="whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString('en-BD', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>{entry.category}</td>
                      <td className="text-gray-500 max-w-xs truncate">{entry.note || '—'}</td>
                      <td className="text-right text-green-600 font-medium">
                        {entry.credit > 0 ? `৳ ${entry.credit.toLocaleString()}` : '—'}
                      </td>
                      <td className="text-right text-red-600 font-medium">
                        {entry.debit > 0 ? `৳ ${entry.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="text-right font-semibold">
                        ৳ {entry.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* Closing Balance Row */}
                  {ledger && ledger.entries.length > 0 && (
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={4} className="text-gray-700">
                        Closing Balance
                      </td>
                      <td className="text-right text-green-700">
                        ৳ {ledger.total_income.toLocaleString()}
                      </td>
                      <td className="text-right text-red-700">
                        ৳ {ledger.total_expense.toLocaleString()}
                      </td>
                      <td className="text-right text-gray-800">
                        ৳ {ledger.closing_balance.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerView;
