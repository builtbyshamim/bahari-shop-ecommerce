import { useEffect, useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { skipToken } from "@reduxjs/toolkit/query";
import { useForm, useWatch } from "react-hook-form";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
} from "../../inventory/products/productApi";
import { useGetAllFeatureTypesQuery } from "../../feature-types/featureTypeApi";
import { useUpdateTopRankingMutation } from "./topRankingProductApi";
import SelectAndSearch from "../../../components/ui/SelectAndSearch";
import InputString from "../../../components/ui/InputString";
import InputNumber from "../../../components/ui/InputNumber";
import ToggleSwitch from "../../../components/ui/toggle/ToggleSwitch";

const EditTopRankingProduct = ({ onClose, ranking }: any) => {
  const [productSearch, setProductSearch] = useState("");
  const [limit, setLimit] = useState(10);

  const {
    register,
    formState: { errors },
    clearErrors,
    setValue,
    handleSubmit,
    reset,
    trigger,
    control,
  } = useForm({
    defaultValues: {
      isActive: ranking?.isActive ?? true,
      productId: ranking?.productId as any,
      featureTypeId: ranking?.featureTypeId as any,
      startAt: ranking?.startAt?.slice(0, 10) as any,
      endAt: ranking?.endAt?.slice(0, 10) as any,
      priority: ranking?.priority as any,
    },
  });

  const watchProduct = useWatch({ control, name: "productId" });
  const debouncedSearch = useDebounce(productSearch);

  const productQueryParams = useMemo(() => {
    if (watchProduct) return skipToken;
    return { search: debouncedSearch || "", limit };
  }, [watchProduct, debouncedSearch, limit]);

  const { data: productData, isFetching: productFetching } =
    useGetAllProductsQuery(productQueryParams);

  const { data: selectedProductData } = useGetSingleProductQuery(
    ranking?.productId,
    { skip: !ranking?.productId },
  );

  const { data: featureTypesRes } = useGetAllFeatureTypesQuery(undefined);
  const featureTypes: any[] = featureTypesRes?.data ?? [];

  const [updateTopRanking, { isLoading }] = useUpdateTopRankingMutation();

  useEffect(() => {
    if (ranking) {
      setValue("productId", ranking.productId);
      setValue("featureTypeId", ranking.featureTypeId);
      setValue("startAt", ranking.startAt?.slice(0, 10));
      setValue("endAt", ranking.endAt?.slice(0, 10));
      setValue("priority", ranking.priority);
      setValue("isActive", ranking.isActive);
    }
  }, [ranking, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const result = await updateTopRanking({ id: ranking.id, data }).unwrap();
      if (result?.success) {
        toast.success("Ranking updated!");
        reset();
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Update failed");
    }
  };

  const currentFeatureTypeName =
    featureTypes.find((ft) => ft.id === ranking?.featureTypeId)?.name ?? "";

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
        onScrollEnd={() => { if (!productFetching) setLimit((p) => p + 10); }}
        defaultValue={selectedProductData?.data?.name}
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
        defaultValue={currentFeatureTypeName}
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

      <InputNumber
        name="priority"
        label="Priority"
        symble=""
        register={register}
        errors={errors}
      />

      <ToggleSwitch
        name="isActive"
        label="Status"
        register={register}
        errors={errors}
        defaultValue={ranking?.isActive}
        onToggle={(val) => setValue("isActive", val)}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 bg-primary-500 text-white rounded-md flex items-center gap-2"
      >
        <FiSave />
        {isLoading ? "Updating..." : "Update Ranking"}
      </button>
    </form>
  );
};

export default EditTopRankingProduct;
