import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import CommonModal from '../../../components/ui/modal/CommonModal';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDeleteAccountMutation, useGetAllAccountsQuery } from './accountApi';
import AddAccount from './AddAccount';
import EditAccount from './EditAccount';

const accountTypeLabel: Record<string, string> = {
  cash: '💵 Cash',
  bank: '🏦 Bank',
  mobile: '📱 Mobile',
};

const AllAccounts = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: accountData,
    error,
    isFetching,
    refetch,
  } = useGetAllAccountsQuery({ ...searchValue, search: debouncedSearch });

  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const accounts = accountData?.data?.data?.data || [];
  const meta = accountData?.data?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDelete = async (account: any) => {
    try {
      const result = await deleteAccount(account?.id).unwrap();
      if (result?.success) {
        toast.success(result?.message || 'Account deleted successfully!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete account. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage cash, bank & mobile accounts</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add New Account
        </button>
      </div>

      <div className="table-container mt-8">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search account name..."
              value={searchValue.search}
              onChange={(e) => setSearchValue({ ...searchValue, search: e.target.value, page: 1 })}
              className="search-input"
              disabled={isFetching}
            />
          </div>
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch accounts'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {accounts.length === 0 && !isFetching ? (
              <EmptyState message="No accounts found" actionText="Add Your First Account" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>ACCOUNT NAME</th>
                      <th>TYPE</th>
                      <th>PROVIDER</th>
                      <th>OPENING BALANCE</th>
                      <th>CURRENT BALANCE</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {accounts.map((account: any, index: number) => (
                      <tr key={account.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                        <td className="font-medium">{account.account_name}</td>
                        <td>{accountTypeLabel[account.account_type] || account.account_type}</td>
                        <td>{account.mobile_provider || '—'}</td>
                        <td className="font-medium">
                          ৳ {Number(account.opening_balance).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`font-semibold ${
                              Number(account.current_balance) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            ৳ {Number(account.current_balance).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={account}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(account)}
                              item={account}
                              disabled={isDeleting}
                              itemName={account?.account_name}
                              tooltip="Delete account"
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

        {accounts.length > 0 && (
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add New Account">
        <AddAccount onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Account"
      >
        <EditAccount account={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllAccounts;
