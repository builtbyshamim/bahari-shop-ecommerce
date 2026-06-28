// EditInventorySettingsModal.tsx
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useUpdateInventorySettingsMutation } from './inventoryApi';

const EditInventorySettingsModal = ({
  inventory,
  onClose,
}: {
  inventory: any;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      is_tracked: inventory?.is_tracked ?? true,
      allow_backorder: inventory?.allow_backorder ?? false,
      low_stock_threshold: inventory?.low_stock_threshold ?? 5,
    },
  });

  const [updateSettings, { isLoading }] = useUpdateInventorySettingsMutation();

  const onSubmit = async (data: any) => {
    try {
      await updateSettings({ id: inventory.id, ...data }).unwrap();
      toast.success('Settings updated!');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update settings');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Read-only info */}
      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium text-gray-700">Product: </span>
          {inventory?.product?.name ?? '—'}
        </p>
        {inventory?.variant && (
          <p>
            <span className="font-medium text-gray-700">Variant: </span>
            {Object.values(inventory.variant.option_values ?? {}).join(' / ')}
          </p>
        )}
      </div>

      <InputString
        name="low_stock_threshold"
        label="Low Stock Alert At"
        placeholder="5"
        required={false}
        register={register}
        errors={errors}
      />
      <ToggleSwitch
        name="is_tracked"
        label="Track Stock"
        register={register}
        errors={errors}
        defaultValue={inventory?.is_tracked ?? true}
        helperText="Disable for digital/unlimited products"
      />
      <ToggleSwitch
        name="allow_backorder"
        label="Allow Backorder"
        register={register}
        errors={errors}
        defaultValue={inventory?.allow_backorder ?? false}
        helperText="Accept orders even when out of stock"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 bg-primary-500 text-white rounded-md hover:bg-primary-400 disabled:opacity-50 flex items-center cursor-pointer"
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2" />
            Saving...
          </>
        ) : (
          <>
            <FiSave className="mr-2" />
            Save Changes
          </>
        )}
      </button>
    </form>
  );
};

export default EditInventorySettingsModal;
