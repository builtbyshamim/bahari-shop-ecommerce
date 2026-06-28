import { useForm, useWatch } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreateInventoryMutation } from './inventoryApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetAllProductsQuery } from '../products/productApi';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';

const CreateInventory = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      qty_on_hand: 0,
      avg_cost_price: 0,
      low_stock_threshold: 5,
      is_tracked: true,
      allow_backorder: false,
      product_id: undefined as any,
    },
  });
  const [productSearch, setProductSearch] = useState('');

  const [limit, setLimit] = useState(10);
  const watchProduct = useWatch({
    control,
    name: 'product_id',
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

  const [createInventory, { isLoading }] = useCreateInventoryMutation();

  const onSubmit = async (data: any) => {
    try {
      console.log('Form Data:', data);
      await createInventory(data).unwrap();
      toast.success('Inventory created!');
      onClose();
    } catch (err: any) {
      console.log('Error creating inventory:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to create inventory');
    }
  };
  const handleLoadMore = () => {
    if (!isFetching) setLimit((prev) => prev + 10);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SelectAndSearch
        clearErrors={clearErrors}
        trigger={trigger}
        setValue={setValue}
        register={register}
        required={true}
        name="product_id"
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

      <InputString
        name="qty_on_hand"
        label="Opening Stock"
        placeholder="0"
        register={register}
        errors={errors}
      />
      <InputString
        name="avg_cost_price"
        label="Cost Price (per unit)"
        placeholder="0.00"
        register={register}
        errors={errors}
      />
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
        defaultValue={true}
        helperText="Disable for digital/unlimited products"
      />
      <ToggleSwitch
        name="allow_backorder"
        label="Allow Backorder"
        register={register}
        errors={errors}
        defaultValue={false}
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
            Create Inventory
          </>
        )}
      </button>
    </form>
  );
};

export default CreateInventory;
