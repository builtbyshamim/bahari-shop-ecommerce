'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/features/auth/AuthLayout';
import SocialButtons from '@/features/auth/SocialButtons';
import toast from 'react-hot-toast';
import { useLoginUserMutation } from '@/redux/api/userApi';
import { setTokens } from '@/helpers/axiosInstance';

interface LoginFormData {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await loginUser(data).unwrap();
      if (res?.success === true) {
        setTokens(res?.data?.accessToken, res?.data?.refreshToken);
        toast.success(res.message || 'Login successful!');
        router.push('/account');
      } else {
        toast.error(res?.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const fieldVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Your favourite flavours are waiting 🍴">
      <motion.form
        variants={formVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Phone Field */}
        <motion.div variants={fieldVariants} className="space-y-1">
          <label className="text-sm font-medium text-black-700 flex items-center gap-2">
            <FiPhone className="text-primary-500" />
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^(?:\+8801|8801|01)[3-9]\d{8}$/,
                  message: 'Invalid Bangladeshi phone number (e.g. 01XXXXXXXXX)',
                },
              })}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none ${
                errors.phone
                  ? 'border-danger-base focus:border-danger-base'
                  : 'border-gray-200 focus:border-primary-400'
              }`}
              placeholder="01XXXXXXXXX"
              disabled={isLoading}
            />
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-danger-base text-xs mt-1"
              >
                {errors.phone.message}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div variants={fieldVariants} className="space-y-1">
          <label className="text-sm font-medium text-black-700 flex items-center gap-2">
            <FiLock className="text-primary-500" />
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 4,
                  message: 'Password must be at least 4 characters',
                },
              })}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none pr-12 ${
                errors.password
                  ? 'border-danger-base focus:border-danger-base'
                  : 'border-gray-200 focus:border-primary-400'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-500 hover:text-primary-500 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-danger-base text-xs mt-1"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div variants={fieldVariants} className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded border-black-300 text-primary-500 focus:ring-primary-400"
              disabled={isLoading}
            />
            <span className="text-sm text-black-600">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-primary-500 hover:text-primary-600 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          variants={fieldVariants}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>

        {/* Social Login */}
        <SocialButtons />
      </motion.form>
    </AuthLayout>
  );
};

export default LoginPage;
