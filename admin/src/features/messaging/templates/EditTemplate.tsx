import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import { useUpdateTemplateMutation } from '../messagingApi';

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'both', label: 'Both' },
];

interface Props {
  template: any;
  onClose: () => void;
}

const EditTemplate = ({ template, onClose }: Props) => {
  const [update, { isLoading }] = useUpdateTemplateMutation();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>();
  const channel = watch('channel');

  useEffect(() => {
    if (template) reset({ ...template });
  }, [template, reset]);

  const onSubmit = async (values: any) => {
    try {
      delete values.createdAt;
      delete values.updatedAt;
      await update({ id: template.id, ...values }).unwrap();
      toast.success('Template updated!');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        label="Template Name"
        name="name"
        placeholder="Template name"
        register={register}
        errors={errors}
        required={true}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
        <select
          {...register('channel')}
          className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300"
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {(channel === 'email' || channel === 'both') && (
        <InputString
          label="Email Subject"
          name="subject"
          placeholder="Email subject line"
          register={register}
          errors={errors}
          required={false}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
        <textarea
          {...register('body', { required: true })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300 resize-none font-mono"
        />
        {errors.body && <p className="text-red-500 text-xs mt-1">Body is required</p>}
        <p className="text-xs text-gray-400 mt-1">
          Use <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> for personalization
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('isActive')} id="isActiveEdit" className="rounded" />
        <label htmlFor="isActiveEdit" className="text-sm text-gray-600">
          Active
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-4 py-2"
        >
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn px-4 py-2 disabled:opacity-60">
          {isLoading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditTemplate;
