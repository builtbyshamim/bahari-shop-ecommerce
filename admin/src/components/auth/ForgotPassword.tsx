import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../../redux/api/authApi';
import CommonModal from '../ui/modal/CommonModal';
import VerifyOtp from './VerifyOtp';
import SetNewPassword from './SetNewPassword';

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [activeVerifyOtpModal, setActiveVerifyOtpModal] = useState<any>(null);
  const [newPasswordData, setNewPasswordData] = useState<{
    email: string;
    resetToken: string;
  } | null>(null);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const onSubmit = async (data: any) => {
    try {
      // Call your API POST
      const result = await forgotPassword(data).unwrap();
      if (result.success) {
        toast.success('Password reset successfully');
        setActiveVerifyOtpModal(data);
      } else {
        toast.error(result.message || 'Password reset  failed!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 shadow rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-6  uppercase">forgot password👋</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-600">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-500 outline-none"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message as string}</p>
            )}
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 disabled:cursor-progress cursor-pointer disabled:opacity-25 bg-primary-500 text-white rounded-lg hover:opacity-80 transition"
          >
            {isLoading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>
      <CommonModal
        isOpen={activeVerifyOtpModal}
        onClose={() => setActiveVerifyOtpModal(false)}
        title="Verify Otp"
      >
        <VerifyOtp
          setNewPasswordData={setNewPasswordData}
          newPasswordData={newPasswordData}
          active={activeVerifyOtpModal}
          setActive={setActiveVerifyOtpModal}
        />
      </CommonModal>

      <CommonModal
        isOpen={!!newPasswordData}
        onClose={() => setNewPasswordData(null)}
        title="Set New Password"
      >
        {newPasswordData && (
          <SetNewPassword
            email={newPasswordData.email}
            resetToken={newPasswordData.resetToken}
            onClose={() => setNewPasswordData(null)}
          />
        )}
      </CommonModal>
    </div>
  );
};

export default ForgotPassword;
