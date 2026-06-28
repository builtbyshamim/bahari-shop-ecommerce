import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import JoditTextEditor from '../../../components/ui/editor/JoditTextEditor';
import { useUpdatePageMutation } from './pagesApi';

const EditPage = ({ page, onClose }: { page: any; onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      sortOrder: page?.sortOrder ?? 0,
      isPublished: page?.isPublished ?? true,
    },
  });

  const [content, setContent] = useState(page?.content || '');
  const [updatePage, { isLoading }] = useUpdatePageMutation();

  useEffect(() => {
    if (page) {
      reset({
        title: page.title,
        slug: page.slug,
        sortOrder: page.sortOrder,
        isPublished: page.isPublished,
      });
      setContent(page.content || '');
    }
  }, [page, reset]);

  const onSubmit = async (data: any) => {
    try {
      const result = await updatePage({ id: page.id, ...data, content }).unwrap();
      if (result?.success !== false) {
        toast.success('Page updated successfully!');
        onClose();
      } else {
        toast.error(result?.message || 'Failed to update page');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update page.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <InputString
        name="title"
        label="Title"
        placeholder="e.g. About Us"
        register={register}
        errors={errors}
        required={true}
      />

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
        defaultValue={page?.isPublished ?? true}
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
            Update Page
          </>
        )}
      </button>
    </form>
  );
};

export default EditPage;
