import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiSave, FiUpload, FiX } from 'react-icons/fi';
import { FaPlay } from 'react-icons/fa';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreateGalleryItemMutation } from './galleryApi';

const AddGalleryItem = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { title: '', mediaType: 'image', videoUrl: '', link: '', sortOrder: 0, isActive: true },
  });

  const mediaType = watch('mediaType');
  const [createItem, { isLoading }] = useCreateGalleryItemMutation();
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
      toast.error(data.mediaType === 'video' ? 'Please upload a thumbnail image.' : 'Please upload an image.');
      return;
    }

    const fd = new FormData();
    fd.append('image', imageFile);
    fd.append('mediaType', data.mediaType);
    if (data.title) fd.append('title', data.title);
    if (data.mediaType === 'video' && data.videoUrl) fd.append('videoUrl', data.videoUrl);
    if (data.mediaType === 'image' && data.link) fd.append('link', data.link);
    fd.append('sortOrder', String(data.sortOrder ?? 0));
    fd.append('isActive', String(data.isActive ?? true));

    try {
      await createItem(fd).unwrap();
      toast.success('Gallery item added!');
      reset();
      removeImage();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add item.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Media Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
        <div className="flex gap-3">
          {['image', 'video'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={type}
                {...register('mediaType')}
                className="accent-primary-500"
              />
              <span className="text-sm capitalize font-medium text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Image / Thumbnail Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {mediaType === 'video' ? 'Video Thumbnail' : 'Image'} <span className="text-red-500">*</span>
        </label>
        {preview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
            <img src={preview} alt="preview" className="w-full h-48 object-cover" />
            {mediaType === 'video' && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <FaPlay size={28} className="text-white opacity-80" />
              </div>
            )}
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
            <FiUpload size={22} className="mb-2" />
            <span className="text-sm">{mediaType === 'video' ? 'Upload thumbnail' : 'Upload image'}</span>
            <span className="text-xs mt-1">Square or landscape, max 5 MB</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </div>

      {/* Video URL (only for video) */}
      {mediaType === 'video' && (
        <InputString
          name="videoUrl"
          label="Video URL"
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          register={register}
          errors={errors}
          required={false}
        />
      )}

      {/* Link (only for image) */}
      {mediaType === 'image' && (
        <InputString
          name="link"
          label="Link (optional, on click)"
          placeholder="/shop or https://..."
          register={register}
          errors={errors}
          required={false}
        />
      )}

      {/* Title */}
      <InputString name="title" label="Title (optional)" placeholder="e.g. New Collection" register={register} errors={errors} required={false} />

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

      <ToggleSwitch name="isActive" label="Active" register={register} errors={errors} defaultValue={true} onToggle={(val) => setValue('isActive', val)} />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 disabled:opacity-50 flex items-center"
      >
        {isLoading ? (
          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
        ) : (
          <><FiSave className="mr-2" />Add to Gallery</>
        )}
      </button>
    </form>
  );
};

export default AddGalleryItem;
