import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreatePathaoStoreMutation } from './PathaoStoreApi';

const AddPathaoStore = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { is_active: true } });

  const [createStore, { isLoading }] = useCreatePathaoStoreMutation();

  const onSubmit = async (data: any) => {
    try {
      const result = await createStore(data).unwrap();
      if (result?.success) {
        toast.success('Pathao store created successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create store');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create store. Please try again.');
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
        defaultValue={true}
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
            Saving...
          </>
        ) : (
          <>
            <FiSave className="mr-2" />
            Save Store
          </>
        )}
      </button>
    </form>
  );
};

export default AddPathaoStore;
