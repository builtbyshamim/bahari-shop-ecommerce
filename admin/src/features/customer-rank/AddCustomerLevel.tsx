import { FiPlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useCreateLevelMutation } from './customerRankApi';
import InputString from '../../components/ui/InputString';
import ToggleSwitch from '../../components/ui/toggle/ToggleSwitch';

interface FormValues {
  name: string;
  badge: string;
  minAmount: number | string;
  maxAmount: number | string;
  discountPercent: number | string;
  sortOrder: number | string;
  isDefault: boolean;
}

const AddCustomerLevel = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      badge: '',
      minAmount: '',
      maxAmount: '',
      discountPercent: 0,
      sortOrder: 1,
      isDefault: false,
    },
  });

  const [createLevel, { isLoading }] = useCreateLevelMutation();

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        name: data.name,
        badge: data.badge || undefined,
        minAmount: Number(data.minAmount),
        maxAmount: data.maxAmount !== '' ? Number(data.maxAmount) : undefined,
        discountPercent: Number(data.discountPercent),
        sortOrder: Number(data.sortOrder),
        isDefault: data.isDefault,
      };

      const result = await createLevel(payload).unwrap();
      if (result?.success !== false) {
        toast.success('Level created successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create level');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create level. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="name"
          label="Level Name"
          placeholder="e.g. Gold"
          register={register}
          errors={errors}
          required
        />
        <InputString
          name="badge"
          label="Badge (Emoji)"
          placeholder="e.g. 🥇"
          register={register}
          errors={errors}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="minAmount"
          label="Min Amount (৳)"
          placeholder="e.g. 15000"
          type="number"
          register={register}
          errors={errors}
          required
        />
        <InputString
          name="maxAmount"
          label="Max Amount (৳)"
          placeholder="Leave empty for unlimited"
          type="number"
          register={register}
          errors={errors}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="discountPercent"
          label="Discount (%)"
          placeholder="e.g. 10"
          type="number"
          register={register}
          errors={errors}
          required
        />
        <InputString
          name="sortOrder"
          label="Sort Order"
          placeholder="e.g. 3"
          type="number"
          register={register}
          errors={errors}
          required
        />
      </div>

      <ToggleSwitch
        name="isDefault"
        label="Set as Default Level"
        register={register}
        errors={errors}
        defaultValue={false}
        onToggle={(val) => setValue('isDefault', val)}
        helperText="Automatically assigned to new customers"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Creating...
          </>
        ) : (
          <>
            <FiPlus className="mr-2" />
            Create Level
          </>
        )}
      </button>
    </form>
  );
};

export default AddCustomerLevel;
