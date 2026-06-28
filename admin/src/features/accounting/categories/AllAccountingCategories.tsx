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
import {
  useDeleteAccountingCategoryMutation,
  useGetAllAccountingCategoriesQuery,
} from './accountingCategoryApi';
import AddAccountingCategory from './AddAccountingCategory';
import EditAccountingCategory from './EditAccountingCategory';

const AllAccountingCategories = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: catData,
    error,
    isFetching,
    refetch,
  } = useGetAllAccountingCategoriesQuery({
    ...searchValue,
    search: debouncedSearch,
    type: typeFilter || undefined,
  });

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteAccountingCategoryMutation();

  const categories = catData?.data?.data?.data || [];
  const meta = catData?.data?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDelete = async (cat: any) => {
    try {
      const result = await deleteCategory(cat?.id).unwrap();
      if (result?.success) {
        toast.success(result?.message || 'Category deleted successfully!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Accounting Categories</h1>
          <p className="text-gray-600 mt-1">Manage income & expense categories</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add New Category
        </button>
      </div>

      <div className="table-container mt-8">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchValue.search}
              onChange={(e) => setSearchValue({ ...searchValue, search: e.target.value, page: 1 })}
              className="search-input"
              disabled={isFetching}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch categories'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {categories.length === 0 && !isFetching ? (
              <EmptyState message="No categories found" actionText="Add Your First Category" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>NAME</th>
                      <th>TYPE</th>
                      <th>DESCRIPTION</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {categories.map((cat: any, index: number) => (
                      <tr key={cat.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                        <td className="font-medium">{cat.name}</td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cat.type === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {cat.type === 'income' ? '↑ Income' : '↓ Expense'}
                          </span>
                        </td>
                        <td className="text-gray-500">{cat.description || '—'}</td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={cat}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(cat)}
                              item={cat}
                              disabled={isDeleting}
                              itemName={cat?.name}
                              tooltip="Delete category"
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

        {categories.length > 0 && (
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add New Category">
        <AddAccountingCategory onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Category"
      >
        <EditAccountingCategory category={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllAccountingCategories;
