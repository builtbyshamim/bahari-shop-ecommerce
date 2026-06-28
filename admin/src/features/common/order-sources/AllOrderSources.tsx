import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDeleteOrderSourceMutation, useGetAllOrderSourcesQuery } from './orderSourceApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import AddOrderSource from './AddOrderSource';
import EditOrderSource from './EditOrderSource';

const AllOrderSources = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const { data, error, isFetching, refetch } = useGetAllOrderSourcesQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const [deleteOrderSource, { isLoading: isDeleting }] = useDeleteOrderSourceMutation();

  // Backend returns a flat array at data.data
  const sources: any[] = data?.data || [];

  const handleDelete = async (source: any) => {
    try {
      const result = await deleteOrderSource(source.id).unwrap();
      if (result?.success) {
        toast.success(result?.message || 'Order source deleted!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete order source.');
    }
  };

  // Client-side search filter (since backend returns flat array)
  const filteredSources = debouncedSearch
    ? sources.filter((s) => s.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : sources;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Sources</h1>
          <p className="text-gray-600 mt-1">Manage where your orders originate from</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
        >
          Add Source
        </button>
      </div>

      <div className="table-container mt-8">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
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
            message={(error as any)?.data?.message || 'Failed to fetch order sources'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {filteredSources.length === 0 && !isFetching ? (
              <EmptyState
                message="No order sources found"
                actionText="Add Your First Source"
              />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>NAME</th>
                      <th>STATUS</th>
                      <th>CREATED AT</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredSources.map((source: any, index: number) => (
                      <tr key={source.id}>
                        <td>{index + 1}</td>
                        <td className="font-medium text-gray-800">{source.name}</td>
                        <td>
                          <StatusBadge isActive={source.status} />
                        </td>
                        <td className="text-gray-500 text-sm">
                          {moment(source.createdAt).format('DD MMM YYYY')}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={source}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(source)}
                              item={source}
                              disabled={isDeleting}
                              itemName={source.name}
                              tooltip="Delete source"
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
      </div>

      {/* Add Modal */}
      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Order Source">
        <AddOrderSource onClose={() => setAddItem(false)} />
      </CommonModal>

      {/* Edit Modal */}
      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Order Source"
      >
        <EditOrderSource source={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllOrderSources;
