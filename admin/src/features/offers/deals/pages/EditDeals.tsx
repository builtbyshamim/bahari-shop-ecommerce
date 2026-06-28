import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import InputString from "../../../../components/ui/InputString";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import SelectAndSearch from "../../../../components/ui/SelectAndSearch";
import ToggleSwitch from "../../../../components/ui/toggle/ToggleSwitch";
import { useUpdateDealMutation } from "../dealsApi";
import {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
} from "../../../inventory/products/productApi";
import InputNumber from "../../../../components/ui/InputNumber";

const EditDeals = ({ onClose, deal }: any) => {
  const [productSearch, setProductSearch] = useState("");

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
      productId: deal?.productId || "",
      type: deal?.type || "",
      discountType: deal?.discountType || "",
      discountValue: deal?.discountValue || "",
      startAt: deal?.startAt?.slice(0, 10) || "",
      endAt: deal?.endAt?.slice(0, 10) || "",
      priority: deal?.priority || "",
      isActive: deal?.isActive ?? true,
    },
  });

  // fetch product list with search
  const { data: productData } = useGetAllProductsQuery({
    search: productSearch,
    limit: 10,
  });

  // fetch the already selected product so it always appears in the list
  const { data: selectedProductData } = useGetSingleProductQuery(
    deal?.productId,
    { skip: !deal?.productId },
  );

  const [updateDeal, { isLoading }] = useUpdateDealMutation();

  // build options: selected product on top, rest below (no duplicate)
  const selectedProduct = selectedProductData?.data;
  const productOptions = [
    ...(selectedProduct
      ? [{ label: selectedProduct.name, value: selectedProduct.id }]
      : []),
    ...(productData?.data?.data
      ?.filter((item: any) => item?.id !== deal?.productId)
      ?.map((item: any) => ({ label: item?.name, value: item?.id })) || []),
  ];

  useEffect(() => {
    if (deal) {
      setValue("productId", deal.productId);
      setValue("type", deal.type);
      setValue("discountType", deal.discountType);
      setValue("discountValue", deal.discountValue);
      setValue("startAt", deal.startAt?.slice(0, 10));
      setValue("endAt", deal.endAt?.slice(0, 10));
      setValue("priority", deal.priority);
      setValue("isActive", deal.isActive ?? true);
    }
  }, [deal]);

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {};

      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null || value === "") return;
        if (typeof value === "boolean") {
          payload[key] = value ? "active" : "inactive";
        } else {
          payload[key] = value;
        }
      });

      const result = await updateDeal({ id: deal.id, data: payload }).unwrap();

      if (result?.success) {
        toast.success("Deal updated successfully!");
        reset();
        onClose();
      } else {
        toast.error(result?.message || "Update failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update deal. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          {/* Product */}
          <SelectAndSearch
            clearErrors={clearErrors}
            trigger={trigger}
            setValue={setValue}
            register={register}
            required={true}
            name="productId"
            errors={errors}
            label="Product"
            placeholder="Select a product"
            options={productOptions}
            onChange={(searchTerm) => setProductSearch(searchTerm)}
            defaultValue={selectedProduct?.name || ""}
          />

          {/* Deal Type */}
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
              { label: "Top Deals", value: "top" },
              { label: "Flash Sales", value: "flash" },
              { label: "Seasonal Campaign", value: "campaign" },
            ]}
            onChange={() => {}}
            defaultValue={
              [
                { label: "Top Deals", value: "top" },
                { label: "Flash Sales", value: "flash" },
                { label: "Seasonal Campaign", value: "campaign" },
              ].find((o) => o.value === deal?.type)?.label || ""
            }
          />

          {/* Discount Type */}
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
              { label: "Percent (%)", value: "percent" },
              { label: "Fixed Amount", value: "fixed" },
            ]}
            onChange={() => {}}
            defaultValue={
              [
                { label: "Percent (%)", value: "percent" },
                { label: "Fixed Amount", value: "fixed" },
              ].find((o) => o.value === deal?.discountType)?.label || ""
            }
          />

          {/* Discount Value */}
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

          {/* Priority */}
          <InputNumber
            placeholder="Enter priority (e.g. 1)"
            name="priority"
            label="Priority"
            register={register}
            symble={null}
            errors={errors}
          />

          {/* Toggle */}
          <ToggleSwitch
            name="isActive"
            label="Deal Status"
            register={register}
            errors={errors}
            defaultValue={deal?.isActive ?? true}
            onToggle={(isActive) => setValue("isActive", isActive)}
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
                Updating...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Update Deal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDeals;
