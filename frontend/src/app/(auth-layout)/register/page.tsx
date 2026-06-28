'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/features/auth/AuthLayout';
import SocialButtons from '@/features/auth/SocialButtons';
import toast from 'react-hot-toast';
import { useRegisterUserMutation } from '@/redux/api/userApi';
import { setTokens } from '@/helpers/axiosInstance';
import Link from 'next/link';

interface RegisterFormData {
  name: string;
  phone: string;
  password: string;
  acceptTerms?: boolean;
}

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await registerUser(data).unwrap();
      if (res?.success == true) {
        setTokens(res?.data?.tokens?.accessToken, res?.data?.tokens?.refreshToken);
        toast.success(res.message || 'Registration successful!');
        router.push('/account');
      } else {
        toast.error(res?.message);
      }
    } catch (error: any) {
      const message = error?.message || 'Registration failed. Please try again.';
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
    <AuthLayout title="Create Account" subtitle="Join us and start shopping">
      <motion.form
        variants={formVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Name Field */}
        <motion.div variants={fieldVariants} className="space-y-1">
          <label className="text-sm font-medium text-black-700 flex items-center gap-2">
            <FiUser className="text-primary-500" />
            Full Name
          </label>
          <input
            type="text"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none ${
              errors.name
                ? 'border-danger-base focus:border-danger-base'
                : 'border-gray-200 focus:border-primary-400'
            }`}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          {errors.name && <p className="text-danger-base text-xs mt-1">{errors.name.message}</p>}
        </motion.div>

        {/* Phone Field */}
        <motion.div variants={fieldVariants} className="space-y-1">
          <label className="text-sm font-medium text-black-700 flex items-center gap-2">
            <FiPhone className="text-primary-500" />
            Phone Number
          </label>
          <input
            type="tel"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^(?:\+88|88)?01[3-9]\d{8}$/,
                message: 'Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)',
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
          {errors.phone && <p className="text-danger-base text-xs mt-1">{errors.phone.message}</p>}
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
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors bg-white/50 focus:outline-none pr-12 ${
                errors.password
                  ? 'border-danger-base focus:border-danger-base'
                  : 'border-gray-200 focus:border-primary-400'
              }`}
              placeholder="Create a password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-500 hover:text-primary-500"
              disabled={isLoading}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-danger-base text-xs mt-1">{errors.password.message}</p>
          )}
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div variants={fieldVariants} className="flex items-start gap-2">
          <input
            type="checkbox"
            {...register('acceptTerms', {
              required: 'You must accept the terms and conditions',
            })}
            className="w-4 h-4 mt-1 rounded border-black-300 text-primary-500 focus:ring-primary-400"
            disabled={isLoading}
          />
          <label className="text-sm text-black-600">
            I accept the{' '}
            <Link href="/pages/terms-and-conditions" className="text-primary-500 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/pages/privacy-policy" className="text-primary-500 hover:underline">
              Privacy Policy
            </Link>
          </label>
        </motion.div>
        {errors.acceptTerms && (
          <p className="text-danger-base text-xs mt-1">{errors.acceptTerms.message}</p>
        )}

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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>

        {/* Social Registration */}
        <SocialButtons />
      </motion.form>
    </AuthLayout>
  );
};

export default RegisterPage;
