import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useUpdateBlogCategoryMutation } from '../blogCategoryApi';

const EditBlogCategory = ({ category, onClose }: { category: any; onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const [updateBlogCategory, { isLoading }] = useUpdateBlogCategoryMutation();

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        sortOrder: category.sortOrder ?? 0,
        isActive: category.isActive ?? true,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: any) => {
    try {
      const result = await updateBlogCategory({ id: category.id, ...data }).unwrap();
      if (result?.success !== false) {
        toast.success('Blog category updated!');
        onClose();
      } else {
        toast.error(result?.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update blog category.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="name"
        label="Name"
        placeholder="e.g. Tech Reviews"
        register={register}
        errors={errors}
        required={true}
      />

      <InputString
        name="slug"
        label="Slug"
        placeholder="e.g. tech-reviews"
        register={register}
        errors={errors}
        required={true}
      />

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Optional short description"
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Sort Order
        </label>
        <input
          type="number"
          min={0}
          {...register('sortOrder')}
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <ToggleSwitch
        name="isActive"
        label="Active"
        register={register}
        errors={errors}
        defaultValue={category?.isActive ?? true}
        onToggle={(val: boolean) => setValue('isActive', val)}
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
            Update Category
          </>
        )}
      </button>
    </form>
  );
};

export default EditBlogCategory;
