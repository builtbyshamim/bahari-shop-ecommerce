import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  useGetAllTrendingSearchesQuery,
  useCreateTrendingSearchMutation,
  useUpdateTrendingSearchMutation,
  useDeleteTrendingSearchMutation,
} from './trendingSearchApi';
import { ErrorState } from '../../components/ui/status/ErrorState';
import { EmptyState } from '../../components/ui/status/EmptyState';
import StatusBadge from '../../components/ui/status/StatusBadge';
import EditWithActionIcon from '../../components/ui/actions/EditWithActionIcon';
import DeleteAction from '../../components/ui/actions/DeleteIcon';
import CommonModal from '../../components/ui/modal/CommonModal';
import InputString from '../../components/ui/InputString';
import InputNumber from '../../components/ui/InputNumber';
import ToggleSwitch from '../../components/ui/toggle/ToggleSwitch';

const TrendingSearchForm = ({ defaultValues, onSubmit, isLoading, submitLabel }: any) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: defaultValues || { isActive: true, position: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="name"
        label="Search Term"
        placeholder="e.g. Ajwa Dates"
        register={register}
        errors={errors}
        required
      />
      <InputNumber
        name="position"
        label="Position (lower = higher priority)"
        symble=""
        register={register}
        errors={errors}
      />
      <ToggleSwitch
        name="isActive"
        label="Active"
        register={register}
        errors={errors}
        defaultValue={defaultValues?.isActive ?? true}
        onToggle={(val: boolean) => setValue('isActive', val)}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
      >
        {isLoading ? 'Saving...' : submitLabel || 'Save'}
      </button>
    </form>
  );
};

const AllTrendingSearches = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const { data: res, error, isFetching, refetch } = useGetAllTrendingSearchesQuery(undefined);
  const [create, { isLoading: isCreating }] = useCreateTrendingSearchMutation();
  const [update, { isLoading: isUpdating }] = useUpdateTrendingSearchMutation();
  const [remove, { isLoading: isDeleting }] = useDeleteTrendingSearchMutation();

  const items: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

  const handleCreate = async (data: any) => {
    try {
      await create(data).unwrap();
      toast.success('Created!');
      setAddOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create');
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      delete data.id; // Remove id from data as it's sent separately
      delete data.createdAt; // Remove createdAt if present
      delete data.updatedAt; // Remove updatedAt if present
      await update({ id: editItem.id, data }).unwrap();
      toast.success('Updated!');
      setEditItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (item: any) => {
    try {
      await remove(item.id).unwrap();
      toast.success('Deleted!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trending Searches</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage search terms shown in the search dropdown
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus />
          Add Search Term
        </button>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to load'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {items.length === 0 && !isFetching ? (
              <EmptyState message="No trending searches yet" actionText="Add First Term" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>NAME</th>
                      <th>POSITION</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {items.map((item: any, index: number) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="font-semibold text-gray-800">{item.name}</td>
                        <td>{item.position}</td>
                        <td>
                          <StatusBadge isActive={item.isActive} />
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={item}
                              onClick={setEditItem}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(item)}
                              item={item}
                              disabled={isDeleting}
                              itemName={item.name}
                              tooltip="Delete trending search"
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

      <CommonModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Trending Search">
        <TrendingSearchForm onSubmit={handleCreate} isLoading={isCreating} submitLabel="Create" />
      </CommonModal>

      <CommonModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Trending Search"
      >
        <TrendingSearchForm
          defaultValues={editItem}
          onSubmit={handleUpdate}
          isLoading={isUpdating}
          submitLabel="Update"
        />
      </CommonModal>
    </div>
  );
};

export default AllTrendingSearches;
