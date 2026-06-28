'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { useSetNewPasswordMutation } from '../../redux/api/authApi';

interface SetNewPasswordProps {
  email: string;
  resetToken: string;
  onClose: () => void;
}

interface PasswordForm {
  new_password: string;
  new_password_confirmation: string;
}
const SetNewPassword: React.FC<SetNewPasswordProps> = ({ resetToken, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [setNewPassword, { isLoading }] = useSetNewPasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordForm>();

  const password = watch('new_password', '');

  const onSubmit = async (data: PasswordForm) => {
    try {
      const payload = {
        resetToken: String(resetToken),
        newPassword: data.new_password,
      };
      const result = await setNewPassword(payload).unwrap();

      if (result.success) {
        toast.success('Password updated successfully!');
        onClose();
        navigate('/login');
      } else {
        toast.error(result.message || 'Failed to update password');
      }
    } catch (err: any) {
      console.log(err, 'errrrr');
      toast.error(err?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
          <FiLock className="text-primary-500" /> Set New Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('new_password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              placeholder="Enter new password"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.new_password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            {errors.new_password && (
              <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('new_password_confirmation', {
                required: 'Please confirm password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              placeholder="Confirm new password"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.new_password_confirmation
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            {errors.new_password_confirmation && (
              <p className="text-red-500 text-sm mt-1">
                {errors.new_password_confirmation.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 cursor-pointer disabled:cursor-progress bg-primary-500 text-white rounded-lg hover:opacity-90 disabled:bg-gray-400 transition"
          >
            {isLoading ? 'Saving...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetNewPassword;
