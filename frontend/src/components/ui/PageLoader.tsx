'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PageLoaderProps {
  fullscreen?: boolean;
  message?: string;
}

export default function PageLoader({ fullscreen = true, message = 'Loading...' }: PageLoaderProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={`flex flex-col items-center justify-center bg-white z-50 ${
          fullscreen ? 'fixed inset-0' : 'w-full py-20'
        }`}
      >
        {/* Spinning ring + logo */}
        <div className="relative w-20 h-20">
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 80 80"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="40" cy="40" r="34" stroke="#ffe6cc" strokeWidth="6" />
            <path
              d="M40 6 A34 34 0 0 1 74 40"
              stroke="#ff6600"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </motion.svg>

          {/* Brand letter */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ff6600] to-[#cc5200] select-none">
              K
            </span>
          </motion.div>
        </div>

        {/* Brand name */}
        <motion.p
          className="mt-4 text-base font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#ff6600] to-[#cc5200]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          Bahari Shop
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="mt-1 text-xs text-gray-400 font-medium tracking-wide"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>

        {/* Animated dots */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#ff6600]"
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
