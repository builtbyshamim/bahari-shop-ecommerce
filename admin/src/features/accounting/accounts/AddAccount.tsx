import { FiSave } from 'react-icons/fi';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import InputNumber from '../../../components/ui/InputNumber';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import { useCreateAccountMutation } from './accountApi';

const ACCOUNT_TYPE_OPTIONS = [
  { label: '💵 Cash', value: 'cash' },
  { label: '🏦 Bank', value: 'bank' },
  { label: '📱 Mobile Banking', value: 'mobile' },
];

const MOBILE_PROVIDER_OPTIONS = [
  { label: 'Bkash', value: 'Bkash' },
  { label: 'Nagad', value: 'Nagad' },
  { label: 'Rocket', value: 'Rocket' },
  { label: 'Upay', value: 'Upay' },
];

const AddAccount = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    trigger,
    reset,
    formState: { errors },
  } = useForm();

  const watchType = useWatch({ control, name: 'account_type' });
  const [createAccount, { isLoading }] = useCreateAccountMutation();

  const onSubmit = async (data: any) => {
    try {
      const result = await createAccount(data).unwrap();
      if (result?.success) {
        toast.success('Account created successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create account');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputString
        name="account_name"
        label="Account Name"
        placeholder="e.g. Main Cash, Dutch Bangla Bank"
        register={register}
        errors={errors}
        required
      />

      <SelectAndSearch
        name="account_type"
        label="Account Type"
        placeholder="Select account type"
        options={ACCOUNT_TYPE_OPTIONS}
        register={register}
        setValue={setValue}
        clearErrors={clearErrors}
        trigger={trigger}
        errors={errors}
        required={true}
        onChange={() => {}}
      />

      {watchType === 'mobile' && (
        <SelectAndSearch
          name="mobile_provider"
          label="Mobile Provider"
          placeholder="Select provider (Bkash, Nagad...)"
          options={MOBILE_PROVIDER_OPTIONS}
          register={register}
          setValue={setValue}
          clearErrors={clearErrors}
          trigger={trigger}
          errors={errors}
          required={false}
          onChange={() => {}}
        />
      )}

      <InputNumber
        name="opening_balance"
        label="Opening Balance"
        placeholder="Enter opening balance (default: 0)"
        register={register}
        errors={errors}
        symble="৳"
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
            Save Account
          </>
        )}
      </button>
    </form>
  );
};

export default AddAccount;
