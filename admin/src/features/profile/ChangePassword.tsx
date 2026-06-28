import { useState } from 'react';
import { ChevronRight, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChangeNewPasswordMutation } from '../../redux/api/authApi';

const ChangePassword = () => {
  const [changePassword, { isLoading }] = useChangeNewPasswordMutation();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggleShow = (field: keyof typeof show) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();
      toast.success(result?.message ?? 'Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to change password');
    }
  };

  const PasswordInput = ({
    name,
    label,
    placeholder,
  }: {
    name: keyof typeof form;
    label: string;
    placeholder: string;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          name={name}
          type={show[name] ? 'text' : 'password'}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6d29]/30 focus:border-[#ff6d29] text-gray-700"
        />
        <button
          type="button"
          onClick={() => toggleShow(name)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
          <span>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#ff6d29]">Change Password</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
        <p className="text-sm text-gray-500 mt-0.5">Update your account password</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#ff6d29]" />
            Security Settings
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordInput
              name="currentPassword"
              label="Current Password"
              placeholder="Enter your current password"
            />
            <PasswordInput
              name="newPassword"
              label="New Password"
              placeholder="Enter new password (min. 6 characters)"
            />
            <PasswordInput
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Re-enter new password"
            />

            {/* Password match indicator */}
            {form.newPassword && form.confirmPassword && (
              <p
                className={`text-xs font-medium ${
                  form.newPassword === form.confirmPassword
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}
              >
                {form.newPassword === form.confirmPassword
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </p>
            )}

            {/* Tips */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium text-[#ff6d29]">Password tips:</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                <li>Minimum 6 characters</li>
                <li>Mix uppercase, lowercase, numbers and symbols</li>
                <li>Avoid using personal information</li>
              </ul>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#ff6d29] text-white text-sm font-medium rounded-lg hover:bg-[#e65a1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="h-4 w-4" />
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
