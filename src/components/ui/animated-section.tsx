'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0, 
  animationType = 'fadeIn' 
}: AnimatedSectionProps) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInView(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animation = animations[animationType];

  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={isInView ? animation.animate : animation.initial}
      transition={{ ...animation.transition, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}

export function FloatingElement({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

export function PulseElement({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

export function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
