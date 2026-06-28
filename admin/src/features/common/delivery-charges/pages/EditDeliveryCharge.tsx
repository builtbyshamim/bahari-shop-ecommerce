import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import InputString from '../../../../components/ui/InputString';
import InputNumber from '../../../../components/ui/InputNumber';
import ToggleSwitch from '../../../../components/ui/toggle/ToggleSwitch';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useUpdateDeliveryChargeMutation } from '../deliveryChargesApi';

const EditDeliveryCharge = ({
  deliveryCharge,
  onClose,
}: {
  deliveryCharge: any;
  onClose: () => void;
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: deliveryCharge?.name || '',
      charge: deliveryCharge?.charge || '',
      description: deliveryCharge?.description || '',
      isActive: deliveryCharge?.isActive ?? true,
    },
  });

  const [updateDeliveryCharge, { isLoading }] = useUpdateDeliveryChargeMutation();

  useEffect(() => {
    if (deliveryCharge) {
      setValue('name', deliveryCharge.name);
      setValue('charge', deliveryCharge.charge);
      setValue('description', deliveryCharge.description || '');
      setValue('isActive', deliveryCharge.isActive ?? true);
    }
  }, [deliveryCharge, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {};
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null || value === '') return;
        payload[key] = value;
      });

      const result = await updateDeliveryCharge({ id: deliveryCharge.id, data: payload }).unwrap();
      if (result?.success !== false) {
        toast.success('Delivery charge updated successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to update delivery charge');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to update delivery charge');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        placeholder="e.g. Inside Dhaka"
        name="name"
        label="Name"
        register={register}
        errors={errors}
        required
      />

      <InputNumber
        placeholder="e.g. 60"
        name="charge"
        label="Charge (৳)"
        register={register}
        errors={errors}
      />

      <InputString
        placeholder="Optional description"
        name="description"
        label="Description"
        register={register}
        errors={errors}
      />

      <ToggleSwitch
        name="isActive"
        label="Status"
        register={register}
        errors={errors}
        defaultValue={deliveryCharge?.isActive ?? true}
        onToggle={(isActive) => setValue('isActive', isActive)}
        helperText="Enable to show this option in checkout"
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
            Update
          </>
        )}
      </button>
    </form>
  );
};

export default EditDeliveryCharge;
