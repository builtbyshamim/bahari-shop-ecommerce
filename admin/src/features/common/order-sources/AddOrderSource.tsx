import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreateOrderSourceMutation } from './orderSourceApi';

const AddOrderSource = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { name: 'ecommerce', status: true } });

  const [createOrderSource, { isLoading }] = useCreateOrderSourceMutation();

  const onSubmit = async (data: any) => {
    try {
      const result = await createOrderSource(data).unwrap();
      if (result?.success) {
        toast.success(result?.message || 'Order source created successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create order source');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create order source. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="name"
        label="Source Name"
        placeholder="e.g. ecommerce, facebook, walk-in"
        register={register}
        errors={errors}
        required
      />

      <ToggleSwitch
        name="status"
        label="Status"
        register={register}
        errors={errors}
        defaultValue={true}
        onToggle={(val) => setValue('status', val)}
        helperText="Enable to make this source available for orders"
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
            Save Source
          </>
        )}
      </button>
    </form>
  );
};

export default AddOrderSource;
