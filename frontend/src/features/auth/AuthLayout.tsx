'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const floatingFoods = [
  { emoji: '🍕', left: -52, top: -8,  rotate: -20, size: 30, delay: 0 },
  { emoji: '🍔', left: 434, top: 22,  rotate: 14,  size: 26, delay: 1.2 },
  { emoji: '🌮', left: -46, top: 260, rotate: -12, size: 24, delay: 2.6 },
  { emoji: '🍜', left: 438, top: 320, rotate: 18,  size: 28, delay: 1.8 },
  { emoji: '🍣', left: -50, top: 490, rotate: 8,   size: 20, delay: 3.2 },
  { emoji: '🧆', left: 442, top: 510, rotate: -10, size: 18, delay: 0.8 },
];

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <div className="w-full max-w-[420px] relative">
      {/* Floating food emojis — desktop only */}
      {floatingFoods.map(({ emoji, left, top, rotate, size, delay }) => (
        <motion.span
          key={emoji}
          className="absolute select-none pointer-events-none hidden lg:block z-10"
          style={{ left, top, fontSize: size, rotate: `${rotate}deg` }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay, duration: 0.5 },
            scale:   { delay, duration: 0.5 },
            y: {
              delay: delay + 0.5,
              duration: 3 + delay * 0.25,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Card */}
      <div
        className="relative bg-white rounded-3xl overflow-hidden border border-orange-100/70"
        style={{
          boxShadow:
            '0 24px 64px -12px rgba(234,93,11,0.13), 0 8px 24px -4px rgba(0,0,0,0.07)',
        }}
      >
        {/* Gradient top stripe */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-primary-500 to-orange-500" />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ea5d0b 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative px-7 sm:px-8 pt-8 pb-8">
          {/* Dish icon + title */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center mb-7"
          >
            <div className="relative mb-4">
              <div
                className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center text-[2.1rem] border border-orange-200/60"
                style={{
                  background: 'linear-gradient(135deg, #fff4ea 0%, #ffe3c8 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(234,93,11,0.07)',
                }}
              >
                🍽️
              </div>
              <div className="absolute inset-0 rounded-[20px] bg-primary-400/15 blur-xl -z-10 scale-150" />
            </div>

            <h1 className="text-[1.55rem] font-bold text-gray-900 leading-tight text-center">
              {title}
            </h1>
            <p className="text-[13.5px] text-gray-500 mt-1 text-center leading-snug">
              {subtitle}
            </p>
          </motion.div>

          {/* Sign In / Create Account tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="flex rounded-xl p-1 mb-7 border border-orange-100/80"
            style={{ background: 'linear-gradient(135deg, #fff8f2 0%, #fff3ea 100%)' }}
          >
            <Link
              href="/login"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-center ${
                isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={
                isLogin
                  ? {
                      background: 'linear-gradient(135deg, #ea5d0b 0%, #f97316 100%)',
                      boxShadow: '0 4px 14px rgba(234,93,11,0.32)',
                    }
                  : {}
              }
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-center ${
                !isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={
                !isLogin
                  ? {
                      background: 'linear-gradient(135deg, #ea5d0b 0%, #f97316 100%)',
                      boxShadow: '0 4px 14px rgba(234,93,11,0.32)',
                    }
                  : {}
              }
            >
              Create Account
            </Link>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14 }}
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Bottom food tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="flex items-center justify-center gap-2 mt-5"
      >
        <span className="text-[15px]">🌶️</span>
        <span className="text-[12px] text-gray-400 font-medium tracking-wide">
          Fresh picks, delivered with love
        </span>
        <span className="text-[15px]">🌶️</span>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
