import { useState } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useGetAllBannersQuery, useDeleteBannerMutation } from './bannerApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import AddBanner from './AddBanner';
import EditBanner from './EditBanner';

const TYPE_BADGE: Record<string, string> = {
  slider: 'bg-blue-100 text-blue-700',
  side: 'bg-purple-100 text-purple-700',
};

const AllBanners = () => {
  const [addItem, setAddItem] = useState(false);
  const [openEditModal, setOpenEditModal] = useState<any>(false);

  const { data, error, isFetching, refetch } = useGetAllBannersQuery(undefined);
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const banners: any[] = data?.data || [];

  const handleDelete = async (banner: any) => {
    try {
      const result = await deleteBanner(banner.id).unwrap();
      if (result?.success !== false) {
        toast.success(result?.message || 'Banner deleted!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete banner.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banners</h1>
          <p className="text-gray-600 mt-1">Manage hero slider and side banners</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
        >
          Add Banner
        </button>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState message={(error as any)?.data?.message || 'Failed to fetch banners'} refetch={refetch} />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {banners.length === 0 && !isFetching ? (
              <EmptyState message="No banners yet" actionText="Add Your First Banner" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>IMAGE</th>
                      <th>TITLE</th>
                      <th>LINK</th>
                      <th>TYPE</th>
                      <th>ORDER</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {banners.map((banner: any, index: number) => (
                      <tr key={banner.id}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={banner.imageUrl}
                            alt={banner.title || 'banner'}
                            className="w-20 h-12 object-cover rounded border border-gray-200"
                          />
                        </td>
                        <td className="font-medium text-gray-800 max-w-[140px] truncate">
                          {banner.title || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="max-w-[140px] truncate text-sm text-gray-500">
                          {banner.link || <span className="text-gray-400">—</span>}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_BADGE[banner.bannerType] ?? 'bg-gray-100 text-gray-600'}`}>
                            {banner.bannerType}
                          </span>
                        </td>
                        <td className="text-gray-600 text-sm">{banner.sortOrder}</td>
                        <td><StatusBadge isActive={banner.isActive} /></td>
                        <td className="text-gray-500 text-sm">{moment(banner.createdAt).format('DD MMM YYYY')}</td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon item={banner} onClick={setOpenEditModal} disabled={isDeleting || isFetching} />
                            <DeleteAction handleDelete={() => handleDelete(banner)} item={banner} disabled={isDeleting} itemName={banner.title || 'this banner'} tooltip="Delete banner" />
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Banner">
        <AddBanner onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal isOpen={!!openEditModal} onClose={() => setOpenEditModal(false)} title="Edit Banner">
        <EditBanner banner={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllBanners;
