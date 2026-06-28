import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave, FiUpload, FiX, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreateTestimonialMutation } from './testimonialsApi';

const COLORS = [
  { label: 'Orange',  value: 0,  preview: 'from-orange-500 to-red-500' },
  { label: 'Violet',  value: 1,  preview: 'from-violet-500 to-purple-600' },
  { label: 'Blue',    value: 2,  preview: 'from-blue-500 to-cyan-500' },
  { label: 'Pink',    value: 3,  preview: 'from-pink-500 to-rose-500' },
  { label: 'Green',   value: 4,  preview: 'from-emerald-500 to-teal-500' },
  { label: 'Amber',   value: 5,  preview: 'from-amber-500 to-orange-500' },
  { label: 'Indigo',  value: 6,  preview: 'from-indigo-500 to-blue-600' },
  { label: 'Teal',    value: 7,  preview: 'from-teal-500 to-cyan-500' },
  { label: 'Red',     value: 8,  preview: 'from-red-500 to-orange-600' },
  { label: 'Sky',     value: 9,  preview: 'from-sky-500 to-blue-500' },
  { label: 'Fuchsia', value: 10, preview: 'from-fuchsia-500 to-pink-600' },
  { label: 'Lime',    value: 11, preview: 'from-lime-500 to-green-500' },
];

const AddTestimonial = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      location: '',
      avatarInitials: '',
      rating: 5,
      review: '',
      productLabel: '',
      colorIndex: 0,
      sortOrder: 0,
      isActive: true,
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [createTestimonial, { isLoading }] = useCreateTestimonialMutation();

  const selectedColor = watch('colorIndex');
  const nameValue = watch('name');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setAvatarFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const autoInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    if (avatarFile) formData.append('avatar', avatarFile);
    formData.append('name', data.name);
    formData.append('location', data.location || '');
    formData.append('avatarInitials', data.avatarInitials || autoInitials(data.name));
    formData.append('rating', String(data.rating));
    formData.append('review', data.review);
    formData.append('productLabel', data.productLabel || '');
    formData.append('colorIndex', String(data.colorIndex ?? 0));
    formData.append('sortOrder', String(data.sortOrder ?? 0));
    formData.append('isActive', String(data.isActive ?? true));

    try {
      const result = await createTestimonial(formData).unwrap();
      if (result?.success !== false) {
        toast.success('Testimonial created!');
        reset();
        removeImage();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create testimonial.');
    }
  };

  const colorClass = COLORS.find((c) => c.value === Number(selectedColor))?.preview ?? 'from-orange-500 to-red-500';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Avatar upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Avatar Photo (optional)
        </label>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden`}>
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <span>{autoInitials(nameValue) || <FiUser size={20} />}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <FiUpload size={12} /> Upload
            </button>
            {preview && (
              <button
                type="button"
                onClick={removeImage}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                <FiX size={12} /> Remove
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>
      </div>

      {/* Name */}
      <InputString name="name" label="Customer Name" placeholder="e.g. Rakibul Islam" register={register} errors={errors} required />

      {/* Avatar Initials */}
      <InputString name="avatarInitials" label="Avatar Initials (auto from name)" placeholder="e.g. RI" register={register} errors={errors} required={false} />

      {/* Location */}
      <InputString name="location" label="Location" placeholder="e.g. Dhaka, Bangladesh" register={register} errors={errors} required={false} />

      {/* Product Label */}
      <InputString name="productLabel" label="Product Label" placeholder="e.g. Purchased: Smartphone" register={register} errors={errors} required={false} />

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Rating <span className="text-rose-500">*</span>
        </label>
        <select
          {...register('rating', { required: true })}
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r}/5)</option>
          ))}
        </select>
      </div>

      {/* Review */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Review <span className="text-rose-500">*</span>
        </label>
        <textarea
          {...register('review', { required: 'Review is required' })}
          rows={3}
          placeholder="Write the customer review..."
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
        {errors.review && <p className="text-red-500 text-xs mt-1">{errors.review.message as string}</p>}
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Avatar Color Theme
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setValue('colorIndex', c.value)}
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.preview} ring-2 ring-offset-1 transition-all ${Number(selectedColor) === c.value ? 'ring-gray-800 scale-110' : 'ring-transparent'}`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Sort & Status */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Sort Order</label>
          <input type="number" min={0} {...register('sortOrder')} className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="flex-1">
          <ToggleSwitch name="isActive" label="Active" register={register} errors={errors} defaultValue={true} onToggle={(val) => setValue('isActive', val)} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isLoading ? (
          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
        ) : (
          <><FiSave className="mr-2" />Save Testimonial</>
        )}
      </button>
    </form>
  );
};

export default AddTestimonial;
