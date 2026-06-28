import { useMemo, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { skipToken } from '@reduxjs/toolkit/query';
import { useForm, useWatch } from 'react-hook-form';
import { useDebounce } from '../../../hooks/useDebounce';
import { useGetAllProductsQuery } from '../../inventory/products/productApi';
import { useGetAllFeatureTypesQuery } from '../../feature-types/featureTypeApi';
import { useCreateTopRankingMutation } from './topRankingProductApi';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import InputString from '../../../components/ui/InputString';
import InputNumber from '../../../components/ui/InputNumber';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';

const AddTopRankingProduct = ({ onClose }: any) => {
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
      featureTypeId: undefined as any,
      priority: 0,
    },
  });

  const watchProduct = useWatch({ control, name: 'productId' });
  const debouncedSearch = useDebounce(productSearch);

  const productQueryParams = useMemo(() => {
    if (watchProduct) return skipToken;
    return { search: debouncedSearch || '', limit };
  }, [watchProduct, debouncedSearch, limit]);

  const { data: productData, isFetching: productFetching } =
    useGetAllProductsQuery(productQueryParams);

  const { data: featureTypesRes } = useGetAllFeatureTypesQuery(undefined);
  const featureTypes: any[] = featureTypesRes?.data ?? [];

  const [createTopRanking, { isLoading }] = useCreateTopRankingMutation();

  const onSubmit = async (data: any) => {
    try {
      const result = await createTopRanking(data).unwrap();
      if (result?.success) {
        toast.success('Top ranking product added!');
        reset();
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to add ranking');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SelectAndSearch
        clearErrors={clearErrors}
        trigger={trigger}
        setValue={setValue}
        register={register}
        required
        name="productId"
        errors={errors}
        label="Product"
        placeholder="Select product"
        options={productData?.data?.data?.map((item: any) => ({
          label: item?.name,
          value: item?.id,
        }))}
        onChange={(search) => setProductSearch(search)}
        onScrollEnd={() => {
          if (!productFetching) setLimit((p) => p + 10);
        }}
      />

      <SelectAndSearch
        clearErrors={clearErrors}
        trigger={trigger}
        setValue={setValue}
        register={register}
        required
        name="featureTypeId"
        errors={errors}
        label="Feature Type"
        placeholder="Select feature type"
        options={featureTypes.map((ft: any) => ({
          label: ft.name,
          value: ft.id,
        }))}
        onChange={() => {}}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputString
          type="date"
          name="startAt"
          label="Start Date"
          register={register}
          errors={errors}
        />
        <InputString
          type="date"
          name="endAt"
          label="End Date"
          register={register}
          errors={errors}
        />
      </div>

      <InputNumber name="priority" label="Priority" symble="" register={register} errors={errors} />

      <ToggleSwitch
        name="isActive"
        label="Status"
        register={register}
        errors={errors}
        defaultValue={true}
        onToggle={(val) => setValue('isActive', val)}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 bg-primary-500 text-white rounded-md flex items-center gap-2"
      >
        <FiSave />
        {isLoading ? 'Saving...' : 'Save Ranking'}
      </button>
    </form>
  );
};

export default AddTopRankingProduct;
