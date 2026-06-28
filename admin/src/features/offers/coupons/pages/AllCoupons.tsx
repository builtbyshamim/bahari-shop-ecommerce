import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import DeleteAction from '../../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../../components/ui/pagination/CommonPagination';
import { ErrorState } from '../../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../../components/ui/status/EmptyState';
import StatusBadge from '../../../../components/ui/status/StatusBadge';
import EditWithActionIcon from '../../../../components/ui/actions/EditWithActionIcon';
import CommonModal from '../../../../components/ui/modal/CommonModal';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useGetAllCouponsQuery, useDeleteCouponMutation } from '../couponsApi';
import AddCoupon from './AddCoupon';
import EditCoupon from './EditCoupon';
import moment from 'moment';

const AllCoupons = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({ search: '', limit: 10, page: 1 });
  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: couponData,
    error,
    isFetching,
    refetch,
  } = useGetAllCouponsQuery({ ...searchValue, search: debouncedSearch });

  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const coupons = couponData?.data?.data || [];
  const meta = couponData?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDelete = async (coupon: any) => {
    try {
      await deleteCoupon(coupon.id).unwrap();
      toast.success('Coupon deleted successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add New Coupon
        </button>
      </div>

      <div className="table-container mt-8">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or description..."
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
          <ErrorState message={(error as any)?.data?.message || 'Failed to fetch coupons'} refetch={refetch} />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {coupons.length === 0 && !isFetching ? (
              <EmptyState message="No coupons found" actionText="Add Your First Coupon" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>CODE</th>
                      <th>TYPE</th>
                      <th>VALUE</th>
                      <th>MIN PURCHASE</th>
                      <th>USES</th>
                      <th>VALIDITY</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {coupons.map((coupon: any, index: number) => (
                      <tr key={coupon.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                        <td>
                          <span className="font-mono font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          {coupon.description && (
                            <p className="text-xs text-gray-400 mt-1 max-w-[180px] truncate">
                              {coupon.description}
                            </p>
                          )}
                        </td>
                        <td className="uppercase font-medium">{coupon.discountType}</td>
                        <td className="font-medium">
                          {coupon.discountType === 'percent'
                            ? `${coupon.discountValue}%`
                            : `৳${coupon.discountValue}`}
                        </td>
                        <td>{coupon.minPurchase ? `৳${coupon.minPurchase}` : '—'}</td>
                        <td>
                          {coupon.usedCount}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                        </td>
                        <td className="text-xs">
                          {coupon.validFrom
                            ? moment(coupon.validFrom).format('DD MMM YY')
                            : '—'}{' '}
                          →{' '}
                          {coupon.validUntil
                            ? moment(coupon.validUntil).format('DD MMM YY')
                            : '∞'}
                        </td>
                        <td>
                          <StatusBadge isActive={coupon.isActive} />
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={coupon}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(coupon)}
                              item={coupon}
                              disabled={isDeleting}
                              itemName={coupon.code}
                              tooltip="Delete coupon"
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

        {coupons.length > 0 && (
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add New Coupon">
        <AddCoupon onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Coupon"
      >
        <EditCoupon coupon={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllCoupons;
