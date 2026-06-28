'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation, useVerifyOtpMutation } from '../../redux/api/authApi';

interface OtpForm {
  otp: string;
}

const VerifyOtp = ({ active, setNewPasswordData, setActive }: any) => {
  // ⏱ Timer: 3 minutes
  const [timeLeft, setTimeLeft] = useState(10);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [forgotPassword, { isLoading: resetOtpLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>();

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // -------------------------------
  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const result = await forgotPassword({ email: active.email }).unwrap();
      if (result.success) {
        toast.success('OTP resent successfully!');
        setTimeLeft(180); // Reset timer
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong!');
    }
  };

  // -------------------------------
  // Submit OTP
  const onSubmit = async (data: OtpForm) => {
    try {
      const payload = { code: data.otp, email: active.email };
      const result = await verifyOtp(payload).unwrap();
      if (result.success) {
        toast.success('OTP verified successfully!');
        // Set data for modal
        setNewPasswordData({
          email: active.email,
          resetToken: result.data?.resetToken, // token from backend
        });
        setActive(null);
      } else {
        toast.error(result.message || 'OTP verification failed!');
      }
    } catch (err: any) {
      console.log(err, 'errerr');
      toast.error(err?.data?.message || 'Invalid OTP!');
    }
  };

  // Timer display in MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
        <h2 className="text-center text-lg font-semibold mb-4">
          OTP sent to: <span className="text-primary-600">{active.email}</span>
        </h2>

        <p className="text-center text-gray-600 mb-4">
          Time remaining: <span className="font-bold text-primary-500">{formatTime(timeLeft)}</span>
        </p>

        {/* OTP Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-600">OTP Code</label>
            <input
              type="text"
              {...register('otp', { required: 'OTP is required' })}
              placeholder="Enter OTP"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 outline-none"
            />
            {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || timeLeft <= 0}
            className="w-full py-3 cursor-pointer disabled:cursor-progress bg-primary-500 text-white rounded-lg hover:opacity-90 disabled:opacity-25 transition"
          >
            {isLoading ? 'Verifying...' : 'Submit'}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-4">
          {timeLeft <= 0 ? (
            <button
              disabled={resetOtpLoading}
              onClick={handleResendOtp}
              className="text-primary-600  text-primary-500 font-medium underline cursor-pointer"
            >
              {resetOtpLoading ? 'Resending OTP...' : "Didn't receive OTP? "}
            </button>
          ) : (
            <p className="text-gray-500 text-sm">Wait for timer to expire to resend OTP</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
