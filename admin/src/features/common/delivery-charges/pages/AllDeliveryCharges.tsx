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
import { useGetAllDeliveryChargesQuery, useDeleteDeliveryChargeMutation } from '../deliveryChargesApi';
import AddDeliveryCharge from './AddDeliveryCharge';
import EditDeliveryCharge from './EditDeliveryCharge';

const AllDeliveryCharges = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({ search: '', limit: 10, page: 1 });
  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: chargesData,
    error,
    isFetching,
    refetch,
  } = useGetAllDeliveryChargesQuery({ ...searchValue, search: debouncedSearch });

  const [deleteDeliveryCharge, { isLoading: isDeleting }] = useDeleteDeliveryChargeMutation();

  const charges = chargesData?.data?.data || chargesData?.data || [];
  const meta = chargesData?.data?.meta || { totalItems: charges.length, totalPages: 1 };

  const handleDelete = async (item: any) => {
    try {
      await deleteDeliveryCharge(item.id).unwrap();
      toast.success('Delivery charge deleted successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete delivery charge');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery Charges</h1>
          <p className="text-gray-600 mt-1">Manage delivery methods and their charges</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add New
        </button>
      </div>

      <div className="table-container mt-8">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
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
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch delivery charges'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {charges.length === 0 && !isFetching ? (
              <EmptyState message="No delivery charges found" actionText="Add Your First Delivery Charge" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>NAME</th>
                      <th>CHARGE</th>
                      <th>DESCRIPTION</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {charges.map((item: any, index: number) => (
                      <tr key={item.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                        <td className="font-medium">{item.name}</td>
                        <td className="font-medium">
                          {Number(item.charge) === 0 ? (
                            <span className="text-green-600 font-semibold">FREE</span>
                          ) : (
                            `৳${Number(item.charge).toFixed(2)}`
                          )}
                        </td>
                        <td className="text-gray-500 text-sm max-w-[200px] truncate">
                          {item.description || '—'}
                        </td>
                        <td>
                          <StatusBadge isActive={item.isActive} />
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
                              tooltip="Delete delivery charge"
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

        {charges.length > 0 && (
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

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Delivery Charge">
        <AddDeliveryCharge onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Delivery Charge"
      >
        <EditDeliveryCharge deliveryCharge={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllDeliveryCharges;
