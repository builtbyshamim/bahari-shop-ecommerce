import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import InputNumber from '../../../components/ui/InputNumber';
import SelectAndSearch from '../../../components/ui/SelectAndSearch';
import { useUpdateEmployeeMutation } from './allEmployeeApi';
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

const EditEmployee = ({ employee, onClose }: { employee: any; onClose: () => void }) => {
  // Shorthand helper — reads from employeeProfile
  const pr = employee?.employeeProfile ?? {};

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // user fields
      full_name: employee?.name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      address: employee?.address || '',
      avatar: employee?.avatar || '',
      // profile fields
      date_of_birth: pr.date_of_birth?.slice(0, 10) || '',
      join_date: pr.join_date?.slice(0, 10) || '',
      employment_type: pr.employment_type || 'full_time',
      status: pr.status || 'active',
      salary: pr.salary || '',
      nid: pr.nid || '',
      emergency_contact: pr.emergency_contact || '',
      designation_id: pr.designation_id || '',
    },
  });

  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  const { data: designationData } = useGetAllDesignationsQuery({ limit: 100 });

  const designationOptions =
    designationData?.data?.data?.data?.map((d: any) => ({ label: d.name, value: d.id })) || [];

  useEffect(() => {
    if (employee) {
      // user fields
      setValue('full_name', employee.name || '');
      setValue('email', employee.email || '');
      setValue('phone', employee.phone || '');
      setValue('address', employee.address || '');
      setValue('avatar', employee.avatar || '');
      // profile fields
      setValue('date_of_birth', pr.date_of_birth?.slice(0, 10) || '');
      setValue('join_date', pr.join_date?.slice(0, 10) || '');
      setValue('employment_type', pr.employment_type || 'full_time');
      setValue('status', pr.status || 'active');
      setValue('salary', pr.salary || '');
      setValue('nid', pr.nid || '');
      setValue('emergency_contact', pr.emergency_contact || '');
      setValue('designation_id', pr.designation_id || '');
    }
  }, [employee]);

  const onSubmit = async (data: any) => {
    try {
      const result = await updateEmployee({ id: employee.id, data }).unwrap();
      if (result?.success) {
        toast.success('Employee updated successfully!');
        reset();
        onClose();
      } else {
        toast.error(result?.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update employee.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ── User fields ───────────────────────────────────────────────── */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Basic Information
      </p>

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
          name="address"
          label="Address"
          placeholder="Dhaka, Bangladesh"
          register={register}
          errors={errors}
        />
      </div>

      {/* ── Profile fields ─────────────────────────────────────────────── */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">
        HRM Information
      </p>

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
          defaultValue={pr.designation?.name || ''}
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
          defaultValue={TYPE_OPTIONS.find((o) => o.value === pr.employment_type)?.label || ''}
        />
      </div>

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
          defaultValue={STATUS_OPTIONS.find((o) => o.value === pr.status)?.label || ''}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputString
          name="nid"
          label="NID Number"
          placeholder="National ID"
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
      </div>

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
            Update Employee
          </>
        )}
      </button>
    </form>
  );
};

export default EditEmployee;
