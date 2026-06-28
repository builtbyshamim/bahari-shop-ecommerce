import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import InputString from '../../../components/ui/InputString';
import { useAddSubscriberMutation } from '../subscribersApi';

const AddSubscriber = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const [addSubscriber, { isLoading }] = useAddSubscriberMutation();

  const onSubmit = async (data: any) => {
    try {
      await addSubscriber(data).unwrap();
      toast.success('Subscriber added successfully!');
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add subscriber');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        placeholder="subscriber@example.com"
        name="email"
        label="Email Address"
        type="email"
        register={register}
        errors={errors}
        required
      />

      <InputString
        placeholder="Full name (optional)"
        name="name"
        label="Name"
        register={register}
        errors={errors}
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
            Add Subscriber
          </>
        )}
      </button>
    </form>
  );
};

export default AddSubscriber;
