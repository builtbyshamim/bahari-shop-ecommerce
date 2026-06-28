import { useEffect, useState, useRef } from 'react';
import { FiSave, FiUpload } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useUpdateBannerMutation } from './bannerApi';

const BANNER_TYPES = [
  { value: 'slider', label: 'Slider (Left swiper)' },
  { value: 'side', label: 'Side (Right fixed)' },
];

const EditBanner = ({ banner, onClose }: { banner: any; onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: banner?.title || '',
      link: banner?.link || '',
      bannerType: banner?.bannerType || 'slider',
      sortOrder: banner?.sortOrder ?? 0,
      isActive: banner?.isActive ?? true,
    },
  });

  const [updateBanner, { isLoading }] = useUpdateBannerMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(banner?.imageUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (banner) {
      setValue('title', banner.title || '');
      setValue('link', banner.link || '');
      setValue('bannerType', banner.bannerType || 'slider');
      setValue('sortOrder', banner.sortOrder ?? 0);
      setValue('isActive', banner.isActive ?? true);
      setPreview(banner.imageUrl || null);
    }
  }, [banner]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(banner?.imageUrl || null); // revert to existing
    if (inputRef.current) inputRef.current.value = '';
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    if (imageFile) formData.append('image', imageFile);
    formData.append('title', data.title || '');
    formData.append('link', data.link || '');
    formData.append('bannerType', data.bannerType);
    formData.append('sortOrder', String(data.sortOrder ?? 0));
    formData.append('isActive', String(data.isActive ?? true));

    try {
      const result = await updateBanner({ id: banner.id, data: formData }).unwrap();
      if (result?.success !== false) {
        toast.success('Banner updated successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update banner.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
        {preview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
            <img src={preview} alt="preview" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={imageFile ? removeImage : () => inputRef.current?.click()}
              className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {imageFile ? 'Revert' : 'Change'}
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
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <InputString
        name="title"
        label="Title (optional)"
        placeholder="e.g. Summer Sale"
        register={register}
        errors={errors}
        required={false}
      />
      <InputString
        name="link"
        label="Link (URL when clicked)"
        placeholder="e.g. /shop"
        register={register}
        errors={errors}
        required={false}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
        <select
          {...register('bannerType')}
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {BANNER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
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
        defaultValue={banner?.isActive ?? true}
        onToggle={(val) => setValue('isActive', val)}
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
            Update Banner
          </>
        )}
      </button>
    </form>
  );
};

export default EditBanner;
