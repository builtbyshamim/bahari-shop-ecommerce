'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { FiPhone, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginModalToggle, registerModalToggle } from '@/redux/features/toggleSlice';
import { useLoginUserMutation, useRegisterUserMutation } from '@/redux/api/userApi';
import { setTokens } from '@/helpers/axiosInstance';
import SocialButtons from '@/features/auth/SocialButtons';
import default_logo from '../../../../public/images/logo/default_logo.png';

type Tab = 'login' | 'register';

interface LoginFormData {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterFormData {
  name: string;
  phone: string;
  password: string;
  acceptTerms?: boolean;
}

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ─── Login Form ───────────────────────────────────────────────────────────────
const LoginForm = ({
  onSuccess,
  onSwitchTab,
}: {
  onSuccess: () => void;
  onSwitchTab: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await loginUser(data).unwrap();
      if (res?.success) {
        setTokens(res?.data?.accessToken, res?.data?.refreshToken);
        toast.success(res.message || 'Login successful!');
        onSuccess();
      } else {
        toast.error(res?.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiPhone className="text-primary-500" size={13} />
            Phone Number
          </label>
          <input
            type="tel"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^(?:\+8801|8801|01)[3-9]\d{8}$/,
                message: 'Invalid phone (e.g. 01XXXXXXXXX)',
              },
            })}
            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-400 ${
              errors.phone
                ? 'border-red-400 focus:border-red-400'
                : 'border-gray-200 focus:border-primary-400'
            }`}
            placeholder="01XXXXXXXXX"
            disabled={isLoading}
          />
          {errors.phone && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs"
            >
              {errors.phone.message}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiLock className="text-primary-500" size={13} />
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 4, message: 'Minimum 4 characters' },
              })}
              className={`w-full px-4 py-3 pr-11 rounded-xl border-2 text-sm transition-all bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-400 ${
                errors.password
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:border-primary-400'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
              disabled={isLoading}
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            onClick={onSuccess}
            className="text-sm text-primary-500 hover:text-primary-600 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.015 }}
          whileTap={{ scale: isLoading ? 1 : 0.985 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <FiArrowRight />
            </>
          )}
        </motion.button>
      </form>

      <SocialButtons onSuccess={onSuccess} />

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSwitchTab}
          className="text-primary-500 font-semibold hover:underline transition-colors"
        >
          Register now
        </button>
      </p>
    </div>
  );
};

// ─── Register Form ────────────────────────────────────────────────────────────
const RegisterForm = ({
  onSuccess,
  onSwitchTab,
}: {
  onSuccess: () => void;
  onSwitchTab: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await registerUser(data).unwrap();
      if (res?.success) {
        setTokens(res?.data?.tokens?.accessToken, res?.data?.tokens?.refreshToken);
        toast.success(res.message || 'Registration successful!');
        onSuccess();
      } else {
        toast.error(res?.message || 'Registration failed.');
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || 'Registration failed. Please try again.',
      );
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiUser className="text-primary-500" size={13} />
            Full Name
          </label>
          <input
            type="text"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-400 ${
              errors.name
                ? 'border-red-400 focus:border-red-400'
                : 'border-gray-200 focus:border-primary-400'
            }`}
            placeholder="Your full name"
            disabled={isLoading}
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiPhone className="text-primary-500" size={13} />
            Phone Number
          </label>
          <input
            type="tel"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^(?:\+88|88)?01[3-9]\d{8}$/,
                message: 'Enter a valid BD phone (01XXXXXXXXX)',
              },
            })}
            className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-400 ${
              errors.phone
                ? 'border-red-400 focus:border-red-400'
                : 'border-gray-200 focus:border-primary-400'
            }`}
            placeholder="01XXXXXXXXX"
            disabled={isLoading}
          />
          {errors.phone && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs"
            >
              {errors.phone.message}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <FiLock className="text-primary-500" size={13} />
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 4, message: 'Minimum 4 characters' },
              })}
              className={`w-full px-4 py-3 pr-11 rounded-xl border-2 text-sm transition-all bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-400 ${
                errors.password
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:border-primary-400'
              }`}
              placeholder="Create a password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Terms */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('acceptTerms', { required: 'Please accept the terms' })}
              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-400 flex-shrink-0"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I accept the{' '}
              <Link
                href="/pages/terms-and-conditions"
                onClick={onSuccess}
                className="text-primary-500 hover:underline font-medium"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/pages/privacy-policy"
                onClick={onSuccess}
                className="text-primary-500 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs"
            >
              {errors.acceptTerms.message}
            </motion.p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.015 }}
          whileTap={{ scale: isLoading ? 1 : 0.985 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <FiArrowRight />
            </>
          )}
        </motion.button>
      </form>

      <SocialButtons onSuccess={onSuccess} />

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button
          onClick={onSwitchTab}
          className="text-primary-500 font-semibold hover:underline transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const AuthModal = () => {
  const dispatch = useAppDispatch();
  const loginValue = useAppSelector((state) => state.sidebarToggle.loginValue);
  const registerValue = useAppSelector((state) => state.sidebarToggle.registerValue);

  const isOpen = loginValue || registerValue;
  const [activeTab, setActiveTab] = useState<Tab>('login');

  // Sync tab to whichever value triggered the open
  useEffect(() => {
    if (loginValue) setActiveTab('login');
    else if (registerValue) setActiveTab('register');
  }, [loginValue, registerValue]);

  const closeModal = useCallback(() => {
    if (loginValue) dispatch(loginModalToggle());
    if (registerValue) dispatch(registerModalToggle());
  }, [loginValue, registerValue, dispatch]);

  // Scroll lock + ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal wrapper — bottom-sheet on mobile, centered on sm+ */}
          <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full sm:max-w-[440px] bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Orange accent line */}
              <div className="h-[3px] bg-gradient-to-r from-primary-400 via-primary-500 to-orange-400" />

              {/* Handle bar — mobile only */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-3 pb-3 sm:pt-5">
                <Image
                  src={default_logo}
                  alt="Logo"
                  width={120}
                  height={36}
                  className="object-contain h-8 w-auto"
                  priority
                />
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab switcher */}
              <div className="px-6 pb-4">
                <div className="relative flex bg-gray-100 rounded-2xl p-1">
                  {/* Animated sliding pill */}
                  <motion.div
                    className="absolute inset-y-1 bg-white rounded-xl shadow-sm"
                    style={{ width: 'calc(50% - 4px)' }}
                    animate={{ left: activeTab === 'login' ? '4px' : 'calc(50%)' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl relative z-10 transition-colors ${
                      activeTab === 'login' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl relative z-10 transition-colors ${
                      activeTab === 'register'
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="px-6 pb-7 overflow-y-auto max-h-[68vh] sm:max-h-[75vh]">
                {/* Title */}
                <div className="mb-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab + '-title'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <h2 className="text-[1.35rem] font-bold text-gray-900 leading-tight">
                        {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {activeTab === 'login'
                          ? 'Sign in to continue your journey'
                          : 'Join us and start shopping today'}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Form with tab transition */}
                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    <motion.div
                      key="login-form"
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LoginForm
                        onSuccess={closeModal}
                        onSwitchTab={() => setActiveTab('register')}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register-form"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RegisterForm
                        onSuccess={closeModal}
                        onSwitchTab={() => setActiveTab('login')}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
