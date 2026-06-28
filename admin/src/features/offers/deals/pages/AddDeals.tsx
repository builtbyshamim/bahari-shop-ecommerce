import { useMemo, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import InputString from '../../../../components/ui/InputString';
import toast from 'react-hot-toast';
import { useForm, useWatch } from 'react-hook-form';
import SelectAndSearch from '../../../../components/ui/SelectAndSearch';
import ToggleSwitch from '../../../../components/ui/toggle/ToggleSwitch';
import { useCreateDealMutation } from '../dealsApi';
import { useGetAllProductsQuery } from '../../../inventory/products/productApi';
import InputNumber from '../../../../components/ui/InputNumber';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDebounce } from '../../../../hooks/useDebounce';

const AddDeals = ({ onClose }: any) => {
  const [productSearch, setProductSearch] = useState('');

  const [limit, setLimit] = useState(10);
  const {
    register,
    formState: { errors },
    clearErrors,
    setValue,
    handleSubmit,
    control,
    reset,
    trigger,
  } = useForm({
    defaultValues: {
      isActive: true,
      productId: undefined as any,
    },
  });
  const watchProduct = useWatch({
    control,
    name: 'productId',
  });
  const debouncedSearch = useDebounce(productSearch);
  const productQueryParams = useMemo(() => {
    if (watchProduct) return skipToken;
    return {
      search: debouncedSearch || '',
      limit,
    };
  }, [watchProduct, debouncedSearch, limit]);

  const { data: productData, isFetching } = useGetAllProductsQuery(productQueryParams);
  const [createDeal, { isLoading }] = useCreateDealMutation();

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {};

      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null || value === '') return;

        if (typeof value === 'boolean') {
          payload[key] = value ? 'active' : 'inactive';
        } else {
          payload[key] = value;
        }
      });

      const result = await createDeal(payload).unwrap();
      if (result?.success) {
        toast.success('Deal added successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Deal add failed');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add deal. Please try again.');
    }
  };
  const handleLoadMore = () => {
    if (!isFetching) setLimit((prev) => prev + 10);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <SelectAndSearch
            clearErrors={clearErrors}
            trigger={trigger}
            setValue={setValue}
            register={register}
            required={true}
            name="productId"
            errors={errors}
            onChange={(searchTerm) => setProductSearch(searchTerm)}
            label="Product"
            placeholder="Select a product"
            options={productData?.data?.data?.map((item: any) => ({
              label: item?.name,
              value: item?.id,
            }))}
            onScrollEnd={handleLoadMore}
          />

          <SelectAndSearch
            clearErrors={clearErrors}
            trigger={trigger}
            setValue={setValue}
            register={register}
            required={true}
            name="type"
            errors={errors}
            label="Deal Type"
            placeholder="Select deal type"
            options={[
              { label: 'Top Deals', value: 'top' },
              { label: 'Flash Sales', value: 'flash' },
              { label: 'Seasonal Campaign', value: 'campaign' },
            ]}
            onChange={() => {}}
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
            options={[
              { label: 'Percent (%)', value: 'percent' },
              { label: 'Fixed Amount', value: 'fixed' },
            ]}
            onChange={() => {}}
          />

          <InputNumber
            placeholder="Enter discount value"
            name="discountValue"
            label="Discount Value"
            register={register}
            errors={errors}
          />

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <InputString
              placeholder="Start date"
              name="startAt"
              label="Start Date"
              type="date"
              register={register}
              errors={errors}
            />
            <InputString
              placeholder="End date"
              name="endAt"
              label="End Date"
              type="date"
              register={register}
              errors={errors}
            />
          </div>

          <InputNumber
            placeholder="Enter priority (e.g. 1)"
            name="priority"
            label="Priority"
            register={register}
            symble={null}
            errors={errors}
          />

          <ToggleSwitch
            name="isActive"
            label="Deal Status"
            register={register}
            errors={errors}
            defaultValue={true}
            onToggle={(isActive) => {
              console.log('Status changed to:', isActive ? 'Active' : 'Inactive');
            }}
            helperText="Enable to make this deal visible"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Deal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDeals;
