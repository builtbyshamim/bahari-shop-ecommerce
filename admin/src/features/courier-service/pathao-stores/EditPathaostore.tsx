import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useUpdatePathaoStoreMutation } from './PathaoStoreApi';

const EditPathaoStore = ({ store, onClose }: { store: any; onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: store?.name || '',
      store_id: store?.store_id || '',
      address: store?.address || '',
      is_active: store?.is_active ?? true,
    },
  });

  const [updateStore, { isLoading }] = useUpdatePathaoStoreMutation();

  useEffect(() => {
    if (store) {
      setValue('name', store.name || '');
      setValue('store_id', store.store_id || '');
      setValue('address', store.address || '');
      setValue('is_active', store.is_active ?? true);
    }
  }, [store]);

  const onSubmit = async (data: any) => {
    try {
      const result = await updateStore({ id: store.id, data }).unwrap();
      if (result?.success) {
        toast.success('Pathao store updated successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update store. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Required fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="name"
          label="Store Name"
          placeholder="e.g. Dhaka Main Store"
          register={register}
          errors={errors}
          required
        />
        <InputString
          name="store_id"
          label="Pathao Store ID"
          placeholder="Store ID from Pathao"
          register={register}
          errors={errors}
          required
        />
      </div>

      <InputString
        name="address"
        label="Full Address"
        placeholder="House 12, Road 5, Dhanmondi, Dhaka"
        register={register}
        errors={errors}
      />

      <ToggleSwitch
        name="is_active"
        label="Store Status"
        register={register}
        errors={errors}
        defaultValue={store?.is_active ?? true}
        onToggle={(val) => setValue('is_active', val)}
        helperText="Enable to use this store for Pathao deliveries"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Updating...
          </>
        ) : (
          <>
            <FiSave className="mr-2" />
            Update Store
          </>
        )}
      </button>
    </form>
  );
};

export default EditPathaoStore;
