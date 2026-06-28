import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import CommonModal from '../../../components/ui/modal/CommonModal';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDeleteTransactionMutation, useGetAllTransactionsQuery } from './transactionApi';
import AddTransaction from './AddTransaction';
import EditTransaction from './EditTransaction';

const AllTransactions = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
    startDate: '',
    endDate: '',
    account_id: '',
    category_id: '',
    type: '',
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: txData,
    error,
    isFetching,
    refetch,
  } = useGetAllTransactionsQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();

  const transactions = txData?.data?.data?.data || [];
  console.log('Fetched transactions:', transactions);
  const meta = txData?.data?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDelete = async (tx: any) => {
    try {
      const result = await deleteTransaction(tx?.id).unwrap();
      if (result?.success) {
        toast.success(result?.message || 'Transaction deleted and balance restored!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete transaction.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600 mt-1">All income and expense records</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Transaction
        </button>
      </div>

      <div className="table-container mt-8">
        {/* Filters Bar */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by note..."
              value={searchValue.search}
              onChange={(e) => setSearchValue({ ...searchValue, search: e.target.value, page: 1 })}
              className="search-input pl-9"
              disabled={isFetching}
            />
          </div>

          <select
            value={searchValue.type}
            onChange={(e) => setSearchValue({ ...searchValue, type: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="date"
            value={searchValue.startDate}
            onChange={(e) => setSearchValue({ ...searchValue, startDate: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={searchValue.endDate}
            onChange={(e) => setSearchValue({ ...searchValue, endDate: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {(searchValue.startDate || searchValue.endDate || searchValue.type) && (
            <button
              onClick={() =>
                setSearchValue({
                  ...searchValue,
                  startDate: '',
                  endDate: '',
                  type: '',
                  page: 1,
                })
              }
              className="text-sm text-red-500 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch transactions'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {transactions.length === 0 && !isFetching ? (
              <EmptyState message="No transactions found" actionText="Add Your First Transaction" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>DATE</th>
                      <th>TYPE</th>
                      <th>ACCOUNT</th>
                      <th>CATEGORY</th>
                      <th>AMOUNT</th>
                      <th>NOTE</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {transactions.map((tx: any, index: number) => (
                      <tr key={tx.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                        <td>{moment(tx.date).format('DD MMM YYYY')}</td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.type === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {tx.type === 'income' ? '↑ Income' : '↓ Expense'}
                          </span>
                        </td>
                        <td className="font-medium">{tx.account?.account_name || '—'}</td>
                        <td>{tx.category?.name || '—'}</td>
                        <td>
                          <span
                            className={`font-semibold ${
                              tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'} ৳{' '}
                            {Number(tx.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="max-w-xs truncate text-gray-500">{tx.note || '—'}</td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={tx}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(tx)}
                              item={tx}
                              disabled={isDeleting}
                              itemName={`${tx.type} of ৳${tx.amount}`}
                              tooltip="Delete transaction (balance will be restored)"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {transactions.length > 0 && (
          <CommonPagination
            total={meta.totalItems}
            totalPage={meta.totalPages}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            refetch={refetch}
            limit={searchValue.limit}
            page={searchValue.page}
            disabled={isFetching || isDeleting}
          />
        )}
      </div>

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Transaction">
        <AddTransaction onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Transaction"
      >
        <EditTransaction transaction={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllTransactions;
