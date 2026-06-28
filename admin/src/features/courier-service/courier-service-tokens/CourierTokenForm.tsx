import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import { useCreateOrUpdateCourierTokenMutation } from './CourierServiceTokenApi';

interface CourierTokenFormProps {
  courierServiceId: number;
  courierServiceName: string;
  existingToken?: any;
  onClose: () => void;
}

const CourierTokenForm = ({
  courierServiceId,
  courierServiceName,
  existingToken,
  onClose,
}: CourierTokenFormProps) => {
  const isEdit = !!existingToken;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      api_key: '',
      secret_key: '',
      username: '',
      password: '',
    },
  });

  const [createOrUpdate, { isLoading }] = useCreateOrUpdateCourierTokenMutation();

  useEffect(() => {
    if (existingToken) {
      setValue('api_key', existingToken.api_key || '');
      setValue('secret_key', existingToken.secret_key || '');
      setValue('username', existingToken.username || '');
      setValue('password', existingToken.password || '');
    }
  }, [existingToken]);

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data, courier_service_id: courierServiceId };
      const result = await createOrUpdate(payload).unwrap();
      if (result?.success) {
        toast.success(
          isEdit ? `${courierServiceName} token updated!` : `${courierServiceName} token saved!`,
        );
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to save token');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save token.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {courierServiceName} — API Credentials
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="api_key"
          label="API Key"
          placeholder="Enter API key"
          register={register}
          errors={errors}
        />
        <InputString
          name="secret_key"
          label="Secret Key"
          placeholder="Enter secret key"
          register={register}
          errors={errors}
        />
      </div>

      {courierServiceId === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputString
            name="username"
            label="Username"
            placeholder="Enter username"
            register={register}
            errors={errors}
            required
          />
          <InputString
            name="password"
            label="Password"
            type="password"
            placeholder="Enter password"
            register={register}
            errors={errors}
            required
          />
        </div>
      )}

      {isEdit && existingToken?.server_generation_token && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Server Token (Read Only)
          </p>
          <p className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 font-mono break-all border border-gray-200">
            {existingToken.server_generation_token}
          </p>
        </div>
      )}

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
            {isEdit ? 'Update Token' : 'Save Token'}
          </>
        )}
      </button>
    </form>
  );
};

export default CourierTokenForm;
