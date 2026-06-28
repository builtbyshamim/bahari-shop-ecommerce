import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import CommonModal from '../../../components/ui/modal/CommonModal';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDeleteDesignationMutation, useGetAllDesignationsQuery } from './DesignationApi';
import AddDesignation from './AddDesignation';
import EditDesignation from './EditDesignation';

const AllDesignations = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({ search: '', limit: 10, page: 1 });
  const debouncedSearch = useDebounce(searchValue.search, 500);

  const { data, error, isFetching, refetch } = useGetAllDesignationsQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const [deleteDesignation, { isLoading: isDeleting }] = useDeleteDesignationMutation();

  const designations = data?.data?.data?.data?.length ? data.data.data?.data : [];
  const meta = data?.data?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDelete = async (item: any) => {
    try {
      const result = await deleteDesignation(item.id).unwrap();
      if (result?.success) toast.success(result?.message || 'Deleted successfully!');
      else toast.error(result?.message || 'Delete failed');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete designation.');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Designations</h1>
          <p className="text-gray-600 mt-1">Manage employee designations / job titles</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Designation
        </button>
      </div>

      <div className="table-container mt-8">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search designation..."
              value={searchValue.search}
              onChange={(e) => setSearchValue({ ...searchValue, search: e.target.value, page: 1 })}
              className="search-input"
              disabled={isFetching}
            />
          </div>
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch designations'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {designations.length === 0 && !isFetching ? (
              <EmptyState message="No designations found" actionText="Add Your First Designation" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>NAME</th>
                      <th>DESCRIPTION</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {designations.map((item: any, index: number) => (
                      <tr key={item.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                        <td className="font-medium">{item.name}</td>
                        <td className="text-gray-500">{item.description || '—'}</td>
                        <td>
                          <StatusBadge isActive={item.is_active} />
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={item}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(item)}
                              item={item}
                              disabled={isDeleting}
                              itemName={item.name}
                              tooltip="Delete designation"
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

        {designations.length > 0 && (
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Designation">
        <AddDesignation onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Designation"
      >
        <EditDesignation designation={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllDesignations;
