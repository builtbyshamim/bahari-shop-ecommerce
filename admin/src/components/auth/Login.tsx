import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminLoginMutation, authApi } from '../../redux/api/authApi';
import { store } from '../../redux/store';
const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const onSubmit = async (data: FieldValues) => {
    try {
      // Call your API POST
      const result = await adminLogin(data).unwrap();
      if (result.success) {
        const pendingToken = localStorage.getItem('fcm_token');
        if (pendingToken) {
          store.dispatch(authApi.endpoints.saveFcmToken.initiate({ fcmToken: pendingToken }));
        }
        toast.success('Login successful!');
        const role = result.data?.user?.role;
        navigate(role === 'EMPLOYEE' ? '/admin/orders' : '/admin');
      } else {
        toast.error(result.message || 'Login failed!');
      }
    } catch (err) {
      toast.error((err as any)?.message || 'Something went wrong!');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-md  p-4 md:p-8 sm:shadow rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-6">Welcome Back 👋</h2>
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
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring focus:ring-primary-500 outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute cursor-pointer right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <Link
              to={'/auth/forgot-password'}
              className={'text-sm text-end block hover:underline hover:text-primary-500'}
            >
              Forgot password
            </Link>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 disabled:cursor-progress cursor-pointer disabled:opacity-40 bg-primary-500 text-white rounded-lg hover:opacity-80 transition"
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-4">Don’t have an account? </p>
      </div>
    </div>
  );
};

export default LoginPage;
