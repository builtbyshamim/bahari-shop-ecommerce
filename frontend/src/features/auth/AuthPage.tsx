import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence, Variant, Variants } from "framer-motion";
import {
  FiMail, FiLock, FiUser, FiPhone,
  FiEye, FiEyeOff, FiArrowRight
} from "react-icons/fi";
import {
  FaFacebook, FaGoogle, FaApple,
  FaTwitter
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLoginUserMutation, useRegisterUserMutation, userApi } from "@/redux/api/userApi";
import { store } from "@/redux/store";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
  const [registerUser, { isLoading: isRegisterLoading }] = useRegisterUserMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const password = watch("password", "");

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        const result = await loginUser({ email: data.email, password: data.password }).unwrap();
        if (result?.data) {
          // Save any FCM token obtained before login
          const pendingToken = localStorage.getItem('fcm_token');
          if (pendingToken) {
            store.dispatch(userApi.endpoints.saveFcmToken.initiate({ fcmToken: pendingToken }));
          }
          toast.success('Login successful!');
          router.push('/');
        }
      } else {
        const result = await registerUser({ email: data.email, phone: data.phone, password: data.password }).unwrap();
        if (result?.data) {
          toast.success('Registration successful! Please login.');
          reset();
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong!');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  const socialButtons = [
    { icon: FaFacebook, color: "#1877f2", name: "Facebook" },
    { icon: FaGoogle, color: "#ea4335", name: "Google" },
    // { icon: FaApple, color: "#000000", name: "Apple" },
    // { icon: FaTwitter, color: "#1da1f2", name: "Twitter" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const cardVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.5,
      }
    },
    exit: { 
      scale: 0.95, 
      opacity: 0,
      transition: {
        duration: 0.3,
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-primary-200 flex items-center justify-center p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animation-delay-4000" />
      </div>

      {/* Main Container */}
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
     
        className="relative w-full max-w-md"
      >
        {/* Glass morphism card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header with toggle */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-black-800 mb-2"
            >
              {isLogin ? "Welcome Back!" : "Create Account"}
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-black-500"
            >
              {isLogin 
                ? "Sign in to continue your journey" 
                : "Join us and start shopping"}
            </motion.p>
          </div>

          {/* Toggle Switch */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="flex bg-black-100 rounded-2xl p-1 mb-8"
          >
            <button
              onClick={() => !isLogin && toggleMode()}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                isLogin 
                  ? "bg-white text-primary-600 shadow-md" 
                  : "text-black-600 hover:text-black-800"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => isLogin && toggleMode()}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                !isLogin 
                  ? "bg-white text-primary-600 shadow-md" 
                  : "text-black-600 hover:text-black-800"
              }`}
            >
              Register
            </button>
          </motion.div>

          {/* Form Container with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="text-sm font-medium text-black-700 flex items-center gap-2">
                    <FiMail className="text-primary-500" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-black-200 focus:border-primary-400 focus:outline-none transition-colors bg-white/50"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-danger-base text-xs mt-1"
                      >
                        {/* {errors.email.message} */}
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Phone Field (Register only) */}
                {!isLogin && (
                  <motion.div
                    variants={itemVariants}
                    className="space-y-1"
                  >
                    <label className="text-sm font-medium text-black-700 flex items-center gap-2">
                      <FiPhone className="text-primary-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10,15}$/,
                          message: "Invalid phone number",
                        },
                      })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-black-200 focus:border-primary-400 focus:outline-none transition-colors bg-white/50"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-danger-base text-xs mt-1">
                        {/* {errors.phone.message} */}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Password Field */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="text-sm font-medium text-black-700 flex items-center gap-2">
                    <FiLock className="text-primary-500" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-black-200 focus:border-primary-400 focus:outline-none transition-colors bg-white/50 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-500 hover:text-primary-500"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                    {errors.password && (
                      <p className="text-danger-base text-xs mt-1">
                        {/* {errors.password.message} */}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Confirm Password (Register only) */}
                {!isLogin && (
                  <motion.div
                    variants={itemVariants}
                    className="space-y-1"
                  >
                    <label className="text-sm font-medium text-black-700 flex items-center gap-2">
                      <FiLock className="text-primary-500" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-black-200 focus:border-primary-400 focus:outline-none transition-colors bg-white/50 pr-12"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-500 hover:text-primary-500"
                      >
                        {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                      {errors.confirmPassword && (
                        <p className="text-danger-base text-xs mt-1">
                          {/* {errors.confirmPassword.message} */}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Forgot Password (Login only) */}
                {isLogin && (
                  <motion.div
                    variants={itemVariants}
                    className="text-right"
                  >
                    <button
                      type="button"
                      className="text-sm text-primary-500 hover:text-primary-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoginLoading || isRegisterLoading}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {(isLoginLoading || isRegisterLoading) ? 'Loading...' : (isLogin ? "Sign In" : "Create Account")}
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Divider */}
                <motion.div
                  variants={itemVariants}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-black-500">
                      Or continue with
                    </span>
                  </div>
                </motion.div>

                {/* Social Login */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-4 gap-3"
                >
                  {socialButtons.map((social, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ y: -3, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="p-3 rounded-xl border-2 border-black-200 hover:border-primary-400 hover:bg-white transition-all group"
                      style={{ color: social.color }}
                    >
                      <social.icon className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform" />
                    </motion.button>
                  ))}
                </motion.div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;