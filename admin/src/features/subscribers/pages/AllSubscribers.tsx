import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import moment from 'moment';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  useGetAllSubscribersQuery,
  useDeleteSubscriberMutation,
  useToggleSubscriberMutation,
} from '../subscribersApi';
import AddSubscriber from './AddSubscriber';

const AllSubscribers = () => {
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({ search: '', limit: 10, page: 1 });
  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: res,
    error,
    isFetching,
    refetch,
  } = useGetAllSubscribersQuery({ ...searchValue, search: debouncedSearch });

  const [deleteSubscriber, { isLoading: isDeleting }] = useDeleteSubscriberMutation();
  const [toggleSubscriber, { isLoading: isToggling }] = useToggleSubscriberMutation();

  const subscribers = res?.data?.data || [];
  const meta = res?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDelete = async (sub: any) => {
    try {
      await deleteSubscriber(sub.id).unwrap();
      toast.success('Subscriber deleted');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete');
    }
  };

  const handleToggle = async (sub: any) => {
    try {
      await toggleSubscriber(sub.id).unwrap();
      toast.success(`Subscriber ${sub.isActive ? 'deactivated' : 'activated'}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const isBusy = isFetching || isDeleting || isToggling;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage newsletter subscribers</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Subscriber
        </button>
      </div>

      <div className="table-container mt-8">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchValue.search}
              onChange={(e) =>
                setSearchValue({ ...searchValue, search: e.target.value, page: 1 })
              }
              className="search-input"
              disabled={isFetching}
            />
          </div>
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch subscribers'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {subscribers.length === 0 && !isFetching ? (
              <EmptyState message="No subscribers found" actionText="Add Your First Subscriber" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>EMAIL</th>
                      <th>NAME</th>
                      <th>SOURCE</th>
                      <th>JOINED</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {subscribers.map((sub: any, index: number) => (
                      <tr key={sub.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                        <td className="font-medium text-gray-800">{sub.email}</td>
                        <td className="text-gray-600">{sub.name || '—'}</td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                            {sub.source}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {moment(sub.createdAt).format('DD MMM YY')}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggle(sub)}
                            disabled={isBusy}
                            className="cursor-pointer disabled:opacity-50"
                            title="Toggle status"
                          >
                            <StatusBadge isActive={sub.isActive} />
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <DeleteAction
                              handleDelete={() => handleDelete(sub)}
                              item={sub}
                              disabled={isBusy}
                              itemName={sub.email}
                              tooltip="Delete subscriber"
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

        {subscribers.length > 0 && (
          <CommonPagination
            total={meta.totalItems}
            totalPage={meta.totalPages}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            refetch={refetch}
            limit={searchValue.limit}
            page={searchValue.page}
            disabled={isBusy}
          />
        )}
      </div>

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Subscriber">
        <AddSubscriber onClose={() => setAddItem(false)} />
      </CommonModal>
    </div>
  );
};

export default AllSubscribers;
