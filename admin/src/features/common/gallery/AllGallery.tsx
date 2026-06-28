import { useState } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import { FaPlay } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { useGetAllGalleryItemsQuery, useDeleteGalleryItemMutation } from './galleryApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import AddGalleryItem from './AddGalleryItem';
import EditGalleryItem from './EditGalleryItem';

const MEDIA_BADGE: Record<string, string> = {
  image: 'bg-blue-100 text-blue-700',
  video: 'bg-red-100 text-red-700',
};

const AllGallery = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const { data, error, isFetching, refetch } = useGetAllGalleryItemsQuery(undefined);
  const [deleteItem, { isLoading: isDeleting }] = useDeleteGalleryItemMutation();

  const items: any[] = data?.data || [];

  const handleDelete = async (item: any) => {
    try {
      await deleteItem(item.id).unwrap();
      toast.success('Gallery item deleted!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete item.');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gallery</h1>
          <p className="text-gray-600 mt-1">Manage images and videos shown in the gallery section</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
        >
          Add Item
        </button>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState message={(error as any)?.data?.message || 'Failed to fetch gallery'} refetch={refetch} />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {items.length === 0 && !isFetching ? (
              <EmptyState message="No gallery items yet" actionText="Add Your First Item" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>PREVIEW</th>
                      <th>TITLE</th>
                      <th>TYPE</th>
                      <th>LINK / VIDEO</th>
                      <th>ORDER</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {items.map((item: any, index: number) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="relative w-20 h-14 rounded overflow-hidden border border-gray-200 bg-gray-100">
                            <img
                              src={item.imageUrl}
                              alt={item.title || 'gallery'}
                              className="w-full h-full object-cover"
                            />
                            {item.mediaType === 'video' && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <FaPlay size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="font-medium text-gray-800 max-w-[140px] truncate">
                          {item.title || <span className="text-gray-400">—</span>}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${MEDIA_BADGE[item.mediaType] ?? 'bg-gray-100 text-gray-600'}`}>
                            {item.mediaType}
                          </span>
                        </td>
                        <td className="max-w-[160px]">
                          {item.mediaType === 'video' && item.videoUrl ? (
                            <a href={item.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate">
                              <FiExternalLink size={11} />
                              <span className="truncate">{item.videoUrl}</span>
                            </a>
                          ) : item.link ? (
                            <span className="text-xs text-gray-500 truncate block">{item.link}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-gray-600 text-sm">{item.sortOrder}</td>
                        <td><StatusBadge isActive={item.isActive} /></td>
                        <td className="text-gray-500 text-sm">{moment(item.createdAt).format('DD MMM YYYY')}</td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon item={item} onClick={setEditItem} disabled={isDeleting || isFetching} />
                            <DeleteAction handleDelete={() => handleDelete(item)} item={item} disabled={isDeleting} itemName={item.title || 'this item'} tooltip="Delete item" />
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

      <CommonModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Gallery Item">
        <AddGalleryItem onClose={() => setAddOpen(false)} />
      </CommonModal>

      <CommonModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Gallery Item">
        <EditGalleryItem item={editItem} onClose={() => setEditItem(null)} />
      </CommonModal>
    </div>
  );
};

export default AllGallery;
