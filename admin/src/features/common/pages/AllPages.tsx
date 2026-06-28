import { useState } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useGetAllPagesQuery, useDeletePageMutation } from './pagesApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import AddPage from './AddPage';
import EditPage from './EditPage';

const AllPages = () => {
  const [addItem, setAddItem] = useState(false);
  const [openEditModal, setOpenEditModal] = useState<any>(false);

  const { data, error, isFetching, refetch } = useGetAllPagesQuery(undefined);
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const pages: any[] = data?.data || [];

  const handleDelete = async (page: any) => {
    try {
      const result = await deletePage(page.id).unwrap();
      if (result?.success !== false) {
        toast.success(result?.message || 'Page deleted!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete page.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pages</h1>
          <p className="text-gray-600 mt-1">Manage static pages (About, Terms, Privacy, etc.)</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
        >
          Add Page
        </button>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch pages'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {pages.length === 0 && !isFetching ? (
              <EmptyState message="No pages yet" actionText="Add Your First Page" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>TITLE</th>
                      <th>SLUG</th>
                      <th>ORDER</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {pages.map((page: any, index: number) => (
                      <tr key={page.id}>
                        <td>{index + 1}</td>
                        <td className="font-medium text-gray-800 max-w-[180px] truncate">
                          {page.title}
                        </td>
                        <td>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            /pages/{page.slug}
                          </code>
                        </td>
                        <td className="text-gray-600 text-sm">{page.sortOrder}</td>
                        <td>
                          <StatusBadge isActive={page.isPublished} />
                        </td>
                        <td className="text-gray-500 text-sm">
                          {moment(page.createdAt).format('DD MMM YYYY')}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={page}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(page)}
                              item={page}
                              disabled={isDeleting}
                              itemName={page.title}
                              tooltip="Delete page"
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Page">
        <AddPage onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Page"
      >
        <EditPage page={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllPages;
