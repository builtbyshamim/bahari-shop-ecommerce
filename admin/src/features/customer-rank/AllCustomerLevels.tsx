import { useState } from 'react';
import { MdOutlineAutorenew } from 'react-icons/md';
import toast from 'react-hot-toast';
import {
  useGetAllLevelsQuery,
  useDeleteLevelMutation,
  useRecalculateRanksMutation,
} from './customerRankApi';
import AddCustomerLevel from './AddCustomerLevel';
import EditCustomerLevel from './EditCustomerLevel';
import { ErrorState } from '../../components/ui/status/ErrorState';
import { EmptyState } from '../../components/ui/status/EmptyState';
import EditWithActionIcon from '../../components/ui/actions/EditWithActionIcon';
import DeleteAction from '../../components/ui/actions/DeleteIcon';
import CommonModal from '../../components/ui/modal/CommonModal';

const AllCustomerLevels = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);

  const { data, error, isFetching, refetch } = useGetAllLevelsQuery('');
  console.log('Customer Levels Data:', data);

  const [deleteLevel, { isLoading: isDeleting }] = useDeleteLevelMutation();
  const [recalculate, { isLoading: isRecalculating }] = useRecalculateRanksMutation();

  const levels = data?.data || [];

  const handleDelete = async (level: any) => {
    try {
      const result = await deleteLevel(level.id).unwrap();
      if (result?.success) {
        toast.success(result?.message || 'Level deleted!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete level.');
    }
  };

  const handleRecalculate = async () => {
    try {
      const result = await recalculate({}).unwrap();
      if (result?.success) {
        toast.success(result?.message || 'Ranks recalculated successfully!');
      } else {
        toast.error(result?.message || 'Recalculation failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to recalculate ranks.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Levels</h1>
          <p className="text-gray-600 mt-1">Manage ranking tiers based on total purchase amount</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating || isFetching}
            className="btn flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdOutlineAutorenew className={`text-lg ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Recalculating...' : 'Recalculate Ranks'}
          </button>
          <button
            onClick={() => setAddItem(true)}
            className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Level
          </button>
        </div>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch levels'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {levels.length === 0 && !isFetching ? (
              <EmptyState message="No customer levels found" actionText="Add Your First Level" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>BADGE</th>
                      <th>LEVEL NAME</th>
                      <th>MIN AMOUNT</th>
                      <th>MAX AMOUNT</th>
                      <th>DISCOUNT</th>
                      <th>SORT</th>
                      <th>DEFAULT</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {levels.map((level: any, index: number) => (
                      <tr key={level.id}>
                        <td>{index + 1}</td>

                        <td>
                          <span className="text-2xl">{level.badge || '—'}</span>
                        </td>

                        <td className="font-medium text-gray-800">{level.name}</td>

                        <td className="text-gray-700">
                          ৳ {Number(level.minAmount).toLocaleString()}
                        </td>

                        <td className="text-gray-700">
                          {level.maxAmount
                            ? `৳ ${Number(level.maxAmount).toLocaleString()}`
                            : '∞ Unlimited'}
                        </td>

                        <td>
                          <span className="font-mono text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {level.discountPercent}% off
                          </span>
                        </td>

                        <td className="text-gray-500 text-sm">{level.sortOrder}</td>

                        <td>
                          {level.isDefault ? (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Default
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={level}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(level)}
                              item={level}
                              disabled={isDeleting}
                              itemName={level.name}
                              tooltip="Delete level"
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

      {/* Add Modal */}
      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Customer Level">
        <AddCustomerLevel onClose={() => setAddItem(false)} />
      </CommonModal>

      {/* Edit Modal */}
      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Customer Level"
      >
        <EditCustomerLevel level={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllCustomerLevels;
