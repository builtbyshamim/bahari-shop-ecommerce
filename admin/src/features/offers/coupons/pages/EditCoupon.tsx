import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import InputString from '../../../../components/ui/InputString';
import InputNumber from '../../../../components/ui/InputNumber';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import SelectAndSearch from '../../../../components/ui/SelectAndSearch';
import ToggleSwitch from '../../../../components/ui/toggle/ToggleSwitch';
import { useUpdateCouponMutation } from '../couponsApi';

const discountTypeOptions = [
  { label: 'Percent (%)', value: 'percent' },
  { label: 'Fixed Amount (৳)', value: 'fixed' },
];

const EditCoupon = ({ coupon, onClose }: { coupon: any; onClose: () => void }) => {
  const {
    register,
    formState: { errors },
    clearErrors,
    setValue,
    handleSubmit,
    reset,
    trigger,
  } = useForm({
    defaultValues: {
      code: coupon?.code || '',
      description: coupon?.description || '',
      discountType: coupon?.discountType || '',
      discountValue: coupon?.discountValue || '',
      minPurchase: coupon?.minPurchase || '',
      maxUses: coupon?.maxUses || '',
      validFrom: coupon?.validFrom?.slice(0, 10) || '',
      validUntil: coupon?.validUntil?.slice(0, 10) || '',
      isActive: coupon?.isActive ?? true,
    },
  });

  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  useEffect(() => {
    if (coupon) {
      setValue('code', coupon.code);
      setValue('description', coupon.description || '');
      setValue('discountType', coupon.discountType);
      setValue('discountValue', coupon.discountValue);
      setValue('minPurchase', coupon.minPurchase || '');
      setValue('maxUses', coupon.maxUses || '');
      setValue('validFrom', coupon.validFrom?.slice(0, 10) || '');
      setValue('validUntil', coupon.validUntil?.slice(0, 10) || '');
      setValue('isActive', coupon.isActive ?? true);
    }
  }, [coupon, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {};
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null || value === '') return;
        payload[key] = value;
      });

      const result = await updateCoupon({ id: coupon.id, data: payload }).unwrap();
      if (result?.success !== false) {
        toast.success('Coupon updated successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to update coupon');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to update coupon');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        placeholder="e.g. SAVE20"
        name="code"
        label="Coupon Code"
        register={register}
        errors={errors}
        required
      />

      <InputString
        placeholder="e.g. Get 20% off on orders above ৳500"
        name="description"
        label="Description (optional)"
        register={register}
        errors={errors}
      />

      <SelectAndSearch
        clearErrors={clearErrors}
        trigger={trigger}
        setValue={setValue}
        register={register}
        required={true}
        name="discountType"
        errors={errors}
        label="Discount Type"
        placeholder="Select discount type"
        options={discountTypeOptions}
        onChange={() => {}}
        defaultValue={
          discountTypeOptions.find((o) => o.value === coupon?.discountType)?.label || ''
        }
      />

      <InputNumber
        placeholder="Enter discount value"
        name="discountValue"
        label="Discount Value"
        register={register}
        errors={errors}
      />

      <InputNumber
        placeholder="Minimum cart total (optional)"
        name="minPurchase"
        label="Min Purchase Amount"
        register={register}
        symble={null}
        errors={errors}
      />

      <InputNumber
        placeholder="Max total uses (leave blank for unlimited)"
        name="maxUses"
        label="Max Uses"
        register={register}
        symble={null}
        errors={errors}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputString
          placeholder="Valid from date"
          name="validFrom"
          label="Valid From"
          type="date"
          register={register}
          errors={errors}
        />
        <InputString
          placeholder="Valid until date"
          name="validUntil"
          label="Valid Until"
          type="date"
          register={register}
          errors={errors}
        />
      </div>

      <ToggleSwitch
        name="isActive"
        label="Coupon Status"
        register={register}
        errors={errors}
        defaultValue={coupon?.isActive ?? true}
        onToggle={(isActive) => setValue('isActive', isActive)}
        helperText="Enable to make this coupon available"
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
            Update Coupon
          </>
        )}
      </button>
    </form>
  );
};

export default EditCoupon;
