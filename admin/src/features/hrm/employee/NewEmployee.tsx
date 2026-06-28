import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import InputNumber from '../../../components/ui/InputNumber';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import { useCreateEmployeeMutation } from './allEmployeeApi';
import { useGetAllDesignationsQuery } from '../designations/DesignationApi';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'On Leave', value: 'on_leave' },
  { label: 'Terminated', value: 'terminated' },
];

const TYPE_OPTIONS = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
];

const AddEmployee = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { status: 'active', employment_type: 'full_time' } });

  const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
  const { data: designationData } = useGetAllDesignationsQuery({ limit: 100 });

  const designationOptions =
    designationData?.data?.data?.data?.map((d: any) => ({ label: d.name, value: d.id })) || [];

  const onSubmit = async (data: any) => {
    try {
      const result = await createEmployee(data).unwrap();
      if (result?.success) {
        toast.success('Employee created successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Failed to create employee');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create employee.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="full_name"
          label="Full Name"
          placeholder="Md. Shamim Hossain"
          register={register}
          errors={errors}
          required
        />
        <InputString
          name="email"
          label="Email"
          type="email"
          placeholder="shamim@company.com"
          register={register}
          errors={errors}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="phone"
          label="Phone"
          placeholder="01712345678"
          register={register}
          errors={errors}
        />
        <InputString
          name="nid"
          label="NID Number"
          placeholder="National ID number"
          register={register}
          errors={errors}
        />
      </div>

      {/* Designation & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectAndSearch
          name="designation_id"
          label="Designation"
          placeholder="Select designation"
          options={designationOptions}
          register={register}
          setValue={setValue}
          clearErrors={clearErrors}
          trigger={trigger}
          errors={errors}
          required={false}
          onChange={() => {}}
        />
        <SelectAndSearch
          name="employment_type"
          label="Employment Type"
          placeholder="Select type"
          options={TYPE_OPTIONS}
          register={register}
          setValue={setValue}
          clearErrors={clearErrors}
          trigger={trigger}
          errors={errors}
          required={false}
          onChange={() => {}}
        />
      </div>

      {/* Status & Salary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectAndSearch
          name="status"
          label="Status"
          placeholder="Select status"
          options={STATUS_OPTIONS}
          register={register}
          setValue={setValue}
          clearErrors={clearErrors}
          trigger={trigger}
          errors={errors}
          required={false}
          onChange={() => {}}
        />
        <InputNumber
          name="salary"
          label="Salary"
          placeholder="Monthly salary"
          register={register}
          errors={errors}
          symble="৳"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="join_date"
          label="Join Date"
          type="date"
          register={register}
          errors={errors}
          required
        />
        <InputString
          name="date_of_birth"
          label="Date of Birth"
          type="date"
          register={register}
          errors={errors}
        />
      </div>

      {/* Address & Emergency */}
      <InputString
        name="address"
        label="Address"
        placeholder="Dhaka, Bangladesh"
        register={register}
        errors={errors}
      />
      <InputString
        name="emergency_contact"
        label="Emergency Contact"
        placeholder="01811111111"
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
            Save Employee
          </>
        )}
      </button>
    </form>
  );
};

export default AddEmployee;
