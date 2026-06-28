import { useState, useEffect } from 'react';
import { FiSave, FiUpload, FiX } from 'react-icons/fi';
import InputString from '../../../../components/ui/InputString';
import InputTextarea from '../../../../components/ui/InputTextarea';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useUpdateCategoryMutation } from '../categoryApi';
import SelectAndSearch from '../../../../components/ui/SelectAndSearch';
import ToggleSwitch from '../../../../components/ui/toggle/ToggleSwitch';
import { useFlattenedCategoryOptions } from '../../../../hooks/useFlattenedCategoryOptions';

const EditCategory = ({ onClose, category }: any) => {
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
      isActive: category?.isActive ?? true,
      name: category?.name || '',
      description: category?.description || '',
      metaDescription: category?.metaDescription || '',
      metaTitle: category?.metaTitle || '',
      parentId: category?.parent?.id || '',
      position: category?.position || 0,
    },
  });

  const [images, setImages] = useState<any>(null);
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  const { options: parentOptions, isLoading: optionsLoading } = useFlattenedCategoryOptions(
    category?.id,
  );

  // Old image preview
  useEffect(() => {
    if (category?.image) {
      setImages({ file: null, preview: category.image });
    }
  }, [category]);

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null || value === '') return;
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, value);
        }
      });

      if (images?.file) {
        formData.append('image', images.file);
      }

      const result = await updateCategory({ id: category.id, data: formData }).unwrap();

      if (result?.success) {
        toast.success('Category updated successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Update failed');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update category');
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImages({ file, preview: URL.createObjectURL(file) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ✅ Parent — nested, self excluded */}
      <SelectAndSearch
        clearErrors={clearErrors}
        trigger={trigger}
        setValue={setValue}
        register={register}
        required={false}
        name="parentId"
        errors={errors}
        label="Parent Category"
        placeholder={optionsLoading ? 'Loading...' : 'Select parent (optional)'}
        options={parentOptions}
      />

      {/* Name */}
      <InputString
        placeholder="Enter category name"
        name="name"
        label="Category Name"
        register={register}
        errors={errors}
      />

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            id="edit-image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {images ? (
            <div className="relative group">
              <img
                src={images.preview}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => setImages(null)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={12} />
              </button>
            </div>
          ) : (
            <label htmlFor="edit-image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center py-2">
                <FiUpload className="text-3xl text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Click to upload new image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </label>
          )}
        </div>
      </div>
      <div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
            <span className="ml-1 text-xs text-gray-400">(lower number = shown first)</span>
          </label>
          <input
            type="number"
            min={0}
            placeholder="0"
            {...register('position', {
              valueAsNumber: true,
              min: { value: 0, message: 'Position must be 0 or greater' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.position && (
            <p className="text-red-500 text-xs mt-1">{errors.position.message as string}</p>
          )}
        </div>
      </div>
      {/* Description */}
      <InputTextarea
        name="description"
        required={false}
        label="Description"
        register={register}
        errors={errors}
        rows={2}
      />

      {/* Meta */}
      <InputTextarea
        name="metaTitle"
        required={false}
        label="Meta Title"
        register={register}
        errors={errors}
        rows={2}
      />
      <InputTextarea
        name="metaDescription"
        label="Meta Description"
        register={register}
        errors={errors}
        required={false}
        rows={2}
      />

      {/* Status */}
      <ToggleSwitch
        name="isActive"
        label="Category Status"
        register={register}
        errors={errors}
        defaultValue={category?.isActive ?? true}
        onToggle={(v) => setValue('isActive', v)}
        helperText="Enable to make this category visible"
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
            Update Category
          </>
        )}
      </button>
    </form>
  );
};

export default EditCategory;
