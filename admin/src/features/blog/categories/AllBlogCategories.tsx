import { useState } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useGetAllBlogCategoriesQuery, useDeleteBlogCategoryMutation } from '../blogCategoryApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import AddBlogCategory from './AddBlogCategory';
import EditBlogCategory from './EditBlogCategory';

const AllBlogCategories = () => {
  const [addItem, setAddItem] = useState(false);
  const [openEditModal, setOpenEditModal] = useState<any>(false);

  const { data, error, isFetching, refetch } = useGetAllBlogCategoriesQuery({ limit: 100 });
  const [deleteBlogCategory, { isLoading: isDeleting }] = useDeleteBlogCategoryMutation();

  const categories: any[] = data?.data?.data || [];

  const handleDelete = async (cat: any) => {
    try {
      const result = await deleteBlogCategory(cat.id).unwrap();
      if (result?.success !== false) {
        toast.success(result?.message || 'Category deleted!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Categories</h1>
          <p className="text-gray-600 mt-1">Manage categories for organizing blog posts</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
        >
          Add Category
        </button>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch blog categories'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {categories.length === 0 && !isFetching ? (
              <EmptyState message="No blog categories yet" actionText="Add Your First Category" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>NAME</th>
                      <th>SLUG</th>
                      <th>DESCRIPTION</th>
                      <th>ORDER</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {categories.map((cat: any, index: number) => (
                      <tr key={cat.id}>
                        <td>{index + 1}</td>
                        <td className="font-medium text-gray-800">{cat.name}</td>
                        <td>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {cat.slug}
                          </code>
                        </td>
                        <td className="text-gray-500 text-sm max-w-[200px] truncate">
                          {cat.description || '—'}
                        </td>
                        <td className="text-gray-600 text-sm">{cat.sortOrder}</td>
                        <td>
                          <StatusBadge isActive={cat.isActive} />
                        </td>
                        <td className="text-gray-500 text-sm">
                          {moment(cat.createdAt).format('DD MMM YYYY')}
                        </td>
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
                              itemName={cat.name}
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
      </div>

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Blog Category">
        <AddBlogCategory onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Blog Category"
      >
        <EditBlogCategory category={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllBlogCategories;
