import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreateDesignationMutation } from './DesignationApi';

const AddDesignation = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { is_active: true },
  });
  const [createDesignation, { isLoading }] = useCreateDesignationMutation();

  const onSubmit = async (data: any) => {
    try {
      const result = await createDesignation(data).unwrap();
      if (result?.success) {
        toast.success('Designation created successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create designation.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="name"
        label="Designation Name"
        placeholder="e.g. Software Engineer, HR Manager"
        register={register}
        errors={errors}
        required
      />
      <InputString
        name="description"
        required={false}
        label="Description (Optional)"
        placeholder="Brief description of this role"
        register={register}
        errors={errors}
      />
      <ToggleSwitch
        name="is_active"
        label="Status"
        register={register}
        errors={errors}
        defaultValue={true}
        onToggle={() => {}}
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
            Saving...
          </>
        ) : (
          <>
            <FiSave className="mr-2" />
            Save Designation
          </>
        )}
      </button>
    </form>
  );
};

export default AddDesignation;
