import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  useGetAllFeatureTypesQuery,
  useCreateFeatureTypeMutation,
  useUpdateFeatureTypeMutation,
  useDeleteFeatureTypeMutation,
} from './featureTypeApi';
import { ErrorState } from '../../components/ui/status/ErrorState';
import { EmptyState } from '../../components/ui/status/EmptyState';
import StatusBadge from '../../components/ui/status/StatusBadge';
import EditWithActionIcon from '../../components/ui/actions/EditWithActionIcon';
import DeleteAction from '../../components/ui/actions/DeleteIcon';
import CommonModal from '../../components/ui/modal/CommonModal';
import InputString from '../../components/ui/InputString';
import InputNumber from '../../components/ui/InputNumber';
import ToggleSwitch from '../../components/ui/toggle/ToggleSwitch';

const FeatureTypeForm = ({ defaultValues, onSubmit, isLoading, submitLabel }: any) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: defaultValues || { isActive: true, priority: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="name"
        label="Feature Type Name"
        placeholder="e.g. Top Products, Trending, New Arrival"
        register={register}
        errors={errors}
        required
      />
      <InputNumber name="priority" label="Priority" symble="" register={register} errors={errors} />
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

const AllFeatureTypes = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const { data: res, error, isFetching, refetch } = useGetAllFeatureTypesQuery(undefined);
  const [createFeatureType, { isLoading: isCreating }] = useCreateFeatureTypeMutation();
  const [updateFeatureType, { isLoading: isUpdating }] = useUpdateFeatureTypeMutation();
  const [deleteFeatureType, { isLoading: isDeleting }] = useDeleteFeatureTypeMutation();

  // findAll returns plain array (not paginated)
  const featureTypes: any[] = res?.data ?? [];

  const handleCreate = async (data: any) => {
    try {
      const result = await createFeatureType(data).unwrap();
      if (result?.success) {
        toast.success('Feature type created!');
        setAddOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create');
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;
      delete data.slug;
      const payload = { id: editItem.id, data };
      console.log('Updating with payload:', payload); // Debug log
      const result = await updateFeatureType({ id: editItem.id, data }).unwrap();
      if (result?.success) {
        toast.success('Feature type updated!');
        setEditItem(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (item: any) => {
    try {
      const result = await deleteFeatureType(item.id).unwrap();
      if (result?.success) toast.success('Deleted!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Feature Types</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create dynamic types (Top Products, Trending, etc.) used in Top Ranking
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus />
          Add Feature Type
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
            {featureTypes.length === 0 && !isFetching ? (
              <EmptyState message="No feature types yet" actionText="Add First Type" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>NAME</th>
                      <th>SLUG</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {featureTypes.map((item: any, index: number) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td className="font-semibold text-gray-800">{item.name}</td>
                        <td>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {item.slug}
                          </code>
                        </td>
                        <td>{item.priority}</td>
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
                              tooltip="Delete feature type"
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

      <CommonModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Feature Type">
        <FeatureTypeForm onSubmit={handleCreate} isLoading={isCreating} submitLabel="Create" />
      </CommonModal>

      <CommonModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Feature Type">
        <FeatureTypeForm
          defaultValues={editItem}
          onSubmit={handleUpdate}
          isLoading={isUpdating}
          submitLabel="Update"
        />
      </CommonModal>
    </div>
  );
};

export default AllFeatureTypes;
