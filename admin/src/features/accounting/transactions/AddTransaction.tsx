import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import InputNumber from '../../../components/ui/InputNumber';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import { useCreateTransactionMutation } from './transactionApi';
import { useGetAllAccountsQuery } from '../accounts/accountApi';
import { useGetAllAccountingCategoriesQuery } from '../categories/accountingCategoryApi';

const AddTransaction = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const watchType = watch('type');
  const [createTransaction, { isLoading }] = useCreateTransactionMutation();

  const { data: accountData } = useGetAllAccountsQuery({ limit: 100 });
  const { data: categoryData } = useGetAllAccountingCategoriesQuery({
    limit: 100,
    type: watchType || undefined,
  });

  const accountOptions =
    accountData?.data?.data?.data?.map((a: any) => ({
      label: `${a.account_name} (৳${Number(a.current_balance).toLocaleString()})`,
      value: a.id,
    })) || [];

  const categoryOptions =
    categoryData?.data?.data?.data?.map((c: any) => ({
      label: c.name,
      value: c.id,
    })) || [];

  const onSubmit = async (data: any) => {
    try {
      const result = await createTransaction({
        ...data,
        amount: Number(data.amount),
      }).unwrap();
      if (result?.success) {
        toast.success('Transaction recorded successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to save transaction');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save transaction. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SelectAndSearch
        name="type"
        label="Transaction Type"
        placeholder="Select type"
        options={[
          { label: '↑ Income', value: 'income' },
          { label: '↓ Expense', value: 'expense' },
        ]}
        register={register}
        setValue={setValue}
        clearErrors={clearErrors}
        trigger={trigger}
        errors={errors}
        required={true}
        onChange={() => {
          // Reset category when type changes
          setValue('category_id', '');
        }}
      />

      <SelectAndSearch
        name="account_id"
        label="Account"
        placeholder="Select account"
        options={accountOptions}
        register={register}
        setValue={setValue}
        clearErrors={clearErrors}
        trigger={trigger}
        errors={errors}
        required={true}
        onChange={() => {}}
      />

      <SelectAndSearch
        name="category_id"
        label="Category"
        placeholder="Select category"
        options={categoryOptions}
        register={register}
        setValue={setValue}
        clearErrors={clearErrors}
        trigger={trigger}
        errors={errors}
        required={true}
        onChange={() => {}}
      />

      <InputNumber
        name="amount"
        label="Amount"
        placeholder="Enter amount"
        register={register}
        errors={errors}
        symble="৳"
        required
      />

      <InputString
        name="date"
        label="Date"
        type="date"
        register={register}
        errors={errors}
        required
      />

      <InputString
        name="note"
        label="Note (Optional)"
        placeholder="e.g. Monthly salary, Office supplies..."
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
            Save Transaction
          </>
        )}
      </button>
    </form>
  );
};

export default AddTransaction;
