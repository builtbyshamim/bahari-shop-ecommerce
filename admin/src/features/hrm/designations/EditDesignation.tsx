import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useUpdateDesignationMutation } from './DesignationApi';

const EditDesignation = ({ designation, onClose }: { designation: any; onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: designation?.name || '',
      description: designation?.description || '',
      is_active: designation?.is_active ?? true,
    },
  });

  const [updateDesignation, { isLoading }] = useUpdateDesignationMutation();

  useEffect(() => {
    if (designation) {
      setValue('name', designation.name);
      setValue('description', designation.description || '');
      setValue('is_active', designation.is_active ?? true);
    }
  }, [designation]);

  const onSubmit = async (data: any) => {
    try {
      const result = await updateDesignation({ id: designation.id, data }).unwrap();
      if (result?.success) {
        toast.success('Designation updated successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update designation.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="name"
        label="Designation Name"
        placeholder="e.g. Software Engineer"
        register={register}
        errors={errors}
        required
      />
      <InputString
        name="description"
        required={false}
        label="Description (Optional)"
        placeholder="Brief description"
        register={register}
        errors={errors}
      />
      <ToggleSwitch
        name="is_active"
        label="Status"
        register={register}
        errors={errors}
        defaultValue={designation?.is_active ?? true}
        onToggle={(val) => setValue('is_active', val)}
        helperText="Enable to make this designation available"
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
            Update Designation
          </>
        )}
      </button>
    </form>
  );
};

export default EditDesignation;
