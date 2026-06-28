import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Star, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  useGetAllReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} from '../reviewApi';
import { ErrorState } from '../../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../../components/ui/status/EmptyState';
import DeleteAction from '../../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../../components/ui/pagination/CommonPagination';

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  approved: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-red-100 text-red-700 border border-red-200',
};

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={12}
        className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
      />
    ))}
  </div>
);

const AllReviews = () => {
  const [searchValue, setSearchValue] = useState({
    search: '',
    status: 'pending',
    page: 1,
    limit: 10,
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: reviewData,
    isFetching,
    error,
    refetch,
  } = useGetAllReviewsQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateReviewStatusMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const reviews = reviewData?.data?.data || [];
  const meta = reviewData?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Review ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id).unwrap();
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const filterTabs = ['pending', 'approved', 'rejected'];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Reviews</h1>
          <p className="text-gray-600 mt-1">Approve, reject or delete customer reviews</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl w-fit shadow-sm">
          {filterTabs.map((s) => {
            const isActive = searchValue.status === s;

            return (
              <button
                key={s}
                onClick={() =>
                  setSearchValue((prev) => ({
                    ...prev,
                    status: s,
                    page: 1,
                  }))
                }
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 
        ${
          isActive
            ? 'bg-primary-500 text-white shadow-md scale-105'
            : 'text-gray-600 hover:bg-white hover:shadow-sm hover:scale-105'
        }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="table-container mt-8">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product or customer..."
              value={searchValue.search}
              onChange={(e) => setSearchValue({ ...searchValue, search: e.target.value, page: 1 })}
              className="search-input"
              disabled={isFetching}
            />
          </div>
        </div>

        {/* Error */}
        {error ? (
          <ErrorState message="Failed to fetch reviews" refetch={refetch} />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            <div className="table-section w-full">
              <table className="table w-full">
                <thead>
                  <tr className="table-row">
                    <th>#</th>
                    <th>CUSTOMER</th>
                    <th>PRODUCT</th>
                    <th>RATING</th>
                    <th>REVIEW</th>
                    <th>HELPFUL</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th className="text-center!">ACTION</th>
                  </tr>
                </thead>

                {reviews.length === 0 && !isFetching ? (
                  <tbody>
                    <tr>
                      <td colSpan={9}>
                        <EmptyState message={`No ${searchValue.status} reviews`} />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="table-body">
                    {reviews.map((review: any, index: number) => (
                      <tr key={review.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>

                        {/* Customer */}
                        <td>
                          <p className="font-medium text-gray-800">{review.user?.name || 'N/A'}</p>
                        </td>

                        {/* Product */}
                        <td>
                          <p
                            className="text-sm text-gray-700 max-w-[140px] truncate"
                            title={review.product?.name}
                          >
                            {review.product?.name || 'N/A'}
                          </p>
                        </td>

                        {/* Rating */}
                        <td>
                          <StarDisplay rating={review.rating} />
                        </td>

                        {/* Review text */}
                        <td>
                          <p className="text-sm text-gray-600 max-w-[220px] line-clamp-2 leading-snug">
                            {review.comment}
                          </p>
                        </td>

                        {/* Helpful */}
                        <td className="text-center text-sm text-gray-500">
                          {review.helpful_count}
                        </td>

                        {/* Status badge */}
                        <td>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[review.status] ?? ''}`}
                          >
                            {review.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-center gap-1.5">
                            {review.status !== 'approved' && (
                              <button
                                onClick={() => handleStatus(review.id, 'approved')}
                                disabled={isUpdating || isDeleting}
                                title="Approve"
                                className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {review.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatus(review.id, 'rejected')}
                                disabled={isUpdating || isDeleting}
                                title="Reject"
                                className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            )}
                            <DeleteAction
                              handleDelete={() => handleDelete(review.id)}
                              item={review}
                              disabled={isDeleting || isUpdating}
                              itemName={`review by ${review.user?.name}`}
                              tooltip="Delete review"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {reviews.length > 0 && (
              <CommonPagination
                total={meta.totalItems}
                totalPage={meta.totalPages}
                setSearchValue={setSearchValue}
                searchValue={searchValue}
                refetch={refetch}
                limit={searchValue.limit}
                page={searchValue.page}
                disabled={isFetching || isDeleting || isUpdating}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReviews;
