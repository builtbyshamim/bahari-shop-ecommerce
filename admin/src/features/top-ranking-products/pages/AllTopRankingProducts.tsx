import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import moment from 'moment';
import AddTopRankingProduct from './AddTopRankingProduct';
import EditTopRankingProduct from './EditTopRankingProduct';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDeleteTopRankingMutation, useGetAllTopRankingsQuery } from './topRankingProductApi';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import { ImageDisplay } from '../../../components/ui/modal/ImageDisplay';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import CommonModal from '../../../components/ui/modal/CommonModal';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';

const AllTopRankingProducts = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);

  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: rankingData,
    error,
    isFetching,
    refetch,
  } = useGetAllTopRankingsQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const [deleteTopRanking, { isLoading: isDeleting }] = useDeleteTopRankingMutation();
  const rankings = rankingData?.data?.data || [];
  console.log('rankings', rankings);
  const meta = rankingData?.data?.meta || {
    totalItems: 0,
    totalPages: 1,
  };

  const handleDelete = async (ranking: any) => {
    try {
      const result = await deleteTopRanking(ranking?.id).unwrap();

      if (result?.success) {
        toast.success('Featured section deleted successfully!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete featured section. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Featured Sections</h1>
          <p className="text-gray-600 mt-1">Manage homepage featured sections</p>
        </div>

        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Featured Section
        </button>
      </div>

      <div className="table-container mt-8">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product name..."
              value={searchValue.search}
              onChange={(e) =>
                setSearchValue({
                  ...searchValue,
                  search: e.target.value,
                  page: 1,
                })
              }
              className="search-input"
              disabled={isFetching}
            />
          </div>
        </div>

        {/* Error */}
        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch rankings'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {rankings.length === 0 && !isFetching ? (
              <EmptyState message="No ranking products found" actionText="Add Your First Ranking" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>IMAGE</th>
                      <th>NAME</th>
                      <th>FEATURE TYPE</th>
                      <th>DURATION</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {rankings.map((item: any, index: number) => (
                      <tr key={item.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>

                        <td>
                          <ImageDisplay
                            src={item?.product?.images?.[0]?.url || '/placeholder-image.png'}
                            alt={item?.product?.name}
                            className="w-10 h-10"
                          />
                        </td>

                        <td className="font-medium">{item.product?.name}</td>

                        <td className="font-medium">{item.featureType?.name ?? '—'}</td>

                        <td>
                          {moment(item.startAt).format('DD MMM YYYY')} -{' '}
                          {moment(item.endAt).format('DD MMM YYYY')}
                        </td>

                        <td>{item.priority}</td>

                        <td>
                          <StatusBadge isActive={item?.isActive} />
                        </td>

                        <td>
                          <div className="flex items-center justify-center w-full gap-2">
                            <EditWithActionIcon
                              item={item}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />

                            <DeleteAction
                              handleDelete={() => handleDelete(item)}
                              item={item}
                              disabled={isDeleting}
                              itemName={item?.product?.name}
                              tooltip="Delete ranking"
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

        {/* Pagination */}
        {rankings.length > 0 && (
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

      {/* Add Modal */}
      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Featured Section">
        <AddTopRankingProduct onClose={() => setAddItem(false)} />
      </CommonModal>

      {/* Edit Modal */}
      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Update Featured Section"
      >
        <EditTopRankingProduct ranking={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllTopRankingProducts;
