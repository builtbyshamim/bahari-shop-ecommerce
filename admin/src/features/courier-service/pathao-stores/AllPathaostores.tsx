import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';

import { useDeletePathaoStoreMutation, useGetAllPathaoStoresQuery } from './PathaoStoreApi';
import AddPathaoStore from './AddPathaostore';
import EditPathaoStore from './EditPathaostore';

const AllPathaoStores = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const { data, error, isFetching, refetch } = useGetAllPathaoStoresQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const [deleteStore, { isLoading: isDeleting }] = useDeletePathaoStoreMutation();

  const stores = data?.data?.data?.data || [];
  const meta = data?.data?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDelete = async (store: any) => {
    try {
      const result = await deleteStore(store.id).unwrap();
      if (result?.success) toast.success(result?.message || 'Store deleted!');
      else toast.error(result?.message || 'Delete failed');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete store.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pathao Stores</h1>
          <p className="text-gray-600 mt-1">Manage your Pathao pickup store locations</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Store
        </button>
      </div>

      <div className="table-container mt-8">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, store ID, city..."
              value={searchValue.search}
              onChange={(e) => setSearchValue({ ...searchValue, search: e.target.value, page: 1 })}
              className="search-input"
              disabled={isFetching}
            />
          </div>
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch stores'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {stores.length === 0 && !isFetching ? (
              <EmptyState message="No Pathao stores found" actionText="Add Your First Store" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>STORE NAME</th>
                      <th>STORE ID</th>

                      <th>ADDRESS</th>

                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {stores.map((store: any, index: number) => (
                      <tr key={store.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>

                        <td className="font-medium text-gray-800">{store.name}</td>

                        <td>
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {store.store_id}
                          </span>
                        </td>

                        <td className="max-w-[180px] truncate text-gray-500 text-sm">
                          {store.address || '—'}
                        </td>

                        <td>
                          <StatusBadge isActive={store.is_active} />
                        </td>

                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={store}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(store)}
                              item={store}
                              disabled={isDeleting}
                              itemName={store.name}
                              tooltip="Delete store"
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

        {stores.length > 0 && (
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Pathao Store">
        <AddPathaoStore onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Pathao Store"
      >
        <EditPathaoStore store={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllPathaoStores;
