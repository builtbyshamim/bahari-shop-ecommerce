import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import JoditTextEditor from '../../../components/ui/editor/JoditTextEditor';
import { useCreatePageMutation } from './pagesApi';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

const AddPage = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,

    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { title: '', slug: '', sortOrder: 0, isPublished: true },
  });

  const [content, setContent] = useState('');
  const [createPage, { isLoading }] = useCreatePageMutation();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title);
    setValue('slug', slugify(title));
  };

  const onSubmit = async (data: any) => {
    try {
      const result = await createPage({ ...data, content }).unwrap();
      if (result?.success !== false) {
        toast.success('Page created successfully!');
        reset();
        setContent('');
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create page');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create page.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          onChange={handleTitleChange}
          placeholder="e.g. About Us"
          className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>
        )}
      </div>

      {/* Slug */}
      <InputString
        name="slug"
        label="Slug (URL)"
        placeholder="e.g. about-us"
        register={register}
        errors={errors}
        required={true}
      />

      {/* Sort Order */}
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

      {/* Published toggle */}
      <ToggleSwitch
        name="isPublished"
        label="Published"
        register={register}
        errors={errors}
        defaultValue={true}
        onToggle={(val) => setValue('isPublished', val)}
      />

      {/* Content */}
      <JoditTextEditor
        label="Page Content"
        required={false}
        content={content}
        setContent={setContent}
        placeholder="Write your page content here..."
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
            Save Page
          </>
        )}
      </button>
    </form>
  );
};

export default AddPage;
