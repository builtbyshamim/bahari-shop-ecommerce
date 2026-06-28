'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useGoogleLoginMutation } from '@/redux/api/userApi';
import { setTokens } from '@/helpers/axiosInstance';
import { useState } from 'react';

interface SocialButtonsProps {
  onSuccess?: () => void;
}

const SocialButtons: React.FC<SocialButtonsProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [googleLoginMutation] = useGoogleLoginMutation();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await googleLoginMutation({ accessToken: tokenResponse.access_token }).unwrap();
        if (res?.success) {
          setTokens(res?.data?.accessToken, res?.data?.refreshToken);
          toast.success(res.message || 'Google login successful!');
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/account');
          }
        } else {
          toast.error(res?.message || 'Google login failed.');
        }
      } catch (error: any) {
        const message = error?.data?.message || error?.message || 'Google login failed.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error('Google sign-in was cancelled or failed.'),
  });

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-[11px] text-gray-400 font-medium tracking-wide uppercase">or continue with</span>
        </div>
      </div>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-[#ea4335]/40 bg-white transition-all text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Continue with Google"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-gray-400"
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
        ) : (
          <FcGoogle className="w-5 h-5" />
        )}
        <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
      </motion.button>
    </>
  );
};

export default SocialButtons;
