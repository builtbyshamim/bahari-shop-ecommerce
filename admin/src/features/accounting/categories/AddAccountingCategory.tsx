// ─── AddAccountingCategory.tsx ────────────────────────────────────────────────
import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import { useCreateAccountingCategoryMutation } from './accountingCategoryApi';

export const AddAccountingCategory = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    reset,
    formState: { errors },
  } = useForm();

  const [createCategory, { isLoading }] = useCreateAccountingCategoryMutation();

  const onSubmit = async (data: any) => {
    try {
      const result = await createCategory(data).unwrap();
      if (result?.success) {
        toast.success('Category created successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create category');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create category.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="name"
        label="Category Name"
        placeholder="e.g. Product Sales, Office Rent"
        register={register}
        errors={errors}
        required
      />

      <SelectAndSearch
        name="type"
        label="Category Type"
        placeholder="Select type"
        options={[
          { label: '↑ Income', value: 'income' },
          { label: '↓ Expense', value: 'expense' },
        ]}
        register={register}
        setValue={setValue}
        clearErrors={clearErrors}
        trigger={trigger}
        errors={errors}
        required={true}
        onChange={() => {}}
      />

      <InputString
        name="description"
        label="Description (Optional)"
        placeholder="Brief description of this category"
        register={register}
        errors={errors}
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
            Save Category
          </>
        )}
      </button>
    </form>
  );
};

export default AddAccountingCategory;
