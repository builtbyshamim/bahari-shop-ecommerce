import { useState, useRef } from 'react';
import { FiSave, FiUpload, FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreateBannerMutation } from './bannerApi';

const BANNER_TYPES = [
  { value: 'slider', label: 'Slider (Left swiper)' },
  { value: 'side', label: 'Side (Right fixed)' },
];

const AddBanner = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { title: '', link: '', bannerType: 'slider', sortOrder: 0, isActive: true },
  });

  const [createBanner, { isLoading }] = useCreateBannerMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onSubmit = async (data: any) => {
    if (!imageFile) {
      toast.error('Please select a banner image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', data.title || '');
    formData.append('link', data.link || '');
    formData.append('bannerType', data.bannerType);
    formData.append('sortOrder', String(data.sortOrder ?? 0));
    formData.append('isActive', String(data.isActive ?? true));

    try {
      const result = await createBanner(formData).unwrap();
      if (result?.success !== false) {
        toast.success('Banner created successfully!');
        reset();
        removeImage();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create banner');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create banner.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banner Image <span className="text-red-500">*</span>
        </label>
        {preview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
            <img src={preview} alt="preview" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
          >
            <FiUpload size={24} className="mb-2" />
            <span className="text-sm">Click to upload image</span>
            <span className="text-xs mt-1">Recommended: 1920×700px</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </div>

      {/* Title */}
      <InputString name="title" label="Title (optional overlay text)" placeholder="e.g. Summer Sale" register={register} errors={errors} required={false} />

      {/* Link */}
      <InputString name="link" label="Link (URL when clicked)" placeholder="e.g. /shop or https://..." register={register} errors={errors} required={false} />

      {/* Banner Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type <span className="text-red-500">*</span></label>
        <select
          {...register('bannerType', { required: true })}
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {BANNER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
        <input
          type="number"
          min={0}
          {...register('sortOrder')}
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Status */}
      <ToggleSwitch name="isActive" label="Active" register={register} errors={errors} defaultValue={true} onToggle={(val) => setValue('isActive', val)} />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isLoading ? (
          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
        ) : (
          <><FiSave className="mr-2" />Save Banner</>
        )}
      </button>
    </form>
  );
};

export default AddBanner;
