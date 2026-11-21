'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-2 border-[var(--border)] border-t-[var(--primary)] rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

export function PulsingDot({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`w-2 h-2 bg-[var(--primary)] rounded-full ${className}`}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

export function SkeletonLoader({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className="h-4 bg-[var(--surface-alt)] rounded"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}
