'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AnimatedCardProps {
  title: string;
  description?: string;
  href?: string;
  icon?: string;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn';
}

function getIconBadge(icon?: string): { container: string; glyph: ReactNode } | null {
  if (!icon) return null;

  const commonGlyph = 'h-4 w-4';

  switch (icon) {
    case 'AI':
      return {
        container: 'bg-[linear-gradient(135deg,#38bdf8,#2563eb)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3 13.7 8.3 19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
            <path d="M5 16.5 5.8 19l2.7.8-2.7.8L5 23l-.8-2.4-2.7-.8 2.7-.8.8-2.5Z" />
          </svg>
        ),
      };
    case 'ST':
    case 'Notes':
      return {
        container: 'bg-[linear-gradient(135deg,#10b981,#14b8a6)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 4.5h8a2 2 0 0 1 2 2v12l-3-1.8-3 1.8-3-1.8-3 1.8v-12a2 2 0 0 1 2-2Z" />
          </svg>
        ),
      };
    case 'EX':
      return {
        container: 'bg-[linear-gradient(135deg,#22c55e,#0ea5e9)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 4.5h10a2 2 0 0 1 2 2v13H5v-13a2 2 0 0 1 2-2Z" />
            <path d="M9 9h6" />
            <path d="M9 13h3" />
            <path d="m14 14.5 1.3 1.3 2.4-2.8" />
          </svg>
        ),
      };
    case 'CS':
      return {
        container: 'bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
            <path d="M4 12.5 12 16l8-3.5" />
            <path d="M4 17 12 20l8-3" />
          </svg>
        ),
      };
    case 'PP':
    case 'Prep':
      return {
        container: 'bg-[linear-gradient(135deg,#f59e0b,#ef4444)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
            <path d="M5 8h14a2 2 0 0 1 2 2v7.5A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5V10a2 2 0 0 1 2-2Z" />
            <path d="M3 13h18" />
            <path d="M10 13v2h4v-2" />
          </svg>
        ),
      };
    case 'CF':
      return {
        container: 'bg-[linear-gradient(135deg,#06b6d4,#0ea5e9)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3 4 7v5c0 5 3.4 7.8 8 9 4.6-1.2 8-4 8-9V7l-8-4Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ),
      };
    case 'TL':
    case 'UT':
    case 'Tools':
      return {
        container: 'bg-[linear-gradient(135deg,#a855f7,#ec4899)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-3.2-3.2 2.4-2Z" />
          </svg>
        ),
      };
    case 'CR':
    case 'CT':
      return {
        container: 'bg-[linear-gradient(135deg,#7c3aed,#d946ef)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5v-11Z" />
            <path d="m10 9 5 3-5 3V9Z" />
          </svg>
        ),
      };
    case 'AC':
      return {
        container: 'bg-[linear-gradient(135deg,#64748b,#0f172a)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
        ),
      };
    case 'Code':
      return {
        container: 'bg-[linear-gradient(135deg,#3b82f6,#6366f1)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m9 8-4 4 4 4" />
            <path d="m15 8 4 4-4 4" />
          </svg>
        ),
      };
    case 'Learn':
    case 'Study':
      return {
        container: 'bg-[linear-gradient(135deg,#22c55e,#06b6d4)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
            <path d="M7 10.5V15c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5" />
          </svg>
        ),
      };
    case 'Plan':
      return {
        container: 'bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 6h12" />
            <path d="M8 12h12" />
            <path d="M8 18h12" />
            <path d="M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
        ),
      };
    case 'Practice':
      return {
        container: 'bg-[linear-gradient(135deg,#f97316,#ef4444)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m14 6 4 4-8 8-4 1 1-4 8-8Z" />
            <path d="m13 7 4 4" />
          </svg>
        ),
      };
    case 'Review':
    case 'FAQ':
      return {
        container: 'bg-[linear-gradient(135deg,#8b5cf6,#ec4899)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9.1 9a3 3 0 1 1 5.8 1c-.5 1.2-1.7 1.7-2.4 2.4-.4.4-.5.8-.5 1.6" />
            <path d="M12 17h.01" />
          </svg>
        ),
      };
    default:
      return {
        container: 'bg-[linear-gradient(135deg,#475569,#334155)] text-white',
        glyph: (
          <svg viewBox="0 0 24 24" className={commonGlyph} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
          </svg>
        ),
      };
  }
}

function getBadgeClass(badge?: string) {
  switch (badge) {
    case 'Smart Workspace':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'Learning Core':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Career Growth':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'Instant Utilities':
      return 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700';
    case 'Publish and Earn':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    case 'Access Layer':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    case 'Popular':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'New':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Creator':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    default:
      return 'border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-soft)]';
  }
}

export function AnimatedCard({
  title,
  description,
  href,
  icon,
  badge,
  className = '',
  children,
  delay = 0,
  animationType = 'fadeIn',
}: AnimatedCardProps) {
  const animations = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slideUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
    },
  };

  const animation = animations[animationType];
  const iconBadge = getIconBadge(icon);

  return (
    <motion.article
      className={`group surface rounded-[22px] border border-[var(--border)] p-4 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary-soft)] hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)] ${className}`}
      initial={animation.initial}
      animate={animation.animate}
      transition={{ duration: 0.6, delay: delay / 1000, ease: 'easeOut' }}
      style={{ marginBottom: '1rem' }}
    >
      {badge ? (
        <span className={`mb-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${getBadgeClass(badge)}`}>
          {badge}
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        {iconBadge ? (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconBadge.container}`}>
            {iconBadge.glyph}
          </span>
        ) : null}
        <div className="flex-1">
          <h3 className="text-[1.02rem] font-extrabold leading-snug tracking-[-0.015em] text-[var(--text)]">{title}</h3>
          {description ? <p className="mt-1.5 text-sm leading-6 text-[var(--text-soft)]">{description}</p> : null}
        </div>
      </div>

      {children}

      {href ? (
        <Link
          href={href}
          className="mt-3 inline-flex items-center text-sm font-bold text-[var(--primary)] transition-all duration-300 hover:translate-x-1 hover:text-[var(--primary-strong)]"
        >
          Learn more -&gt;
        </Link>
      ) : null}
    </motion.article>
  );
}

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function AnimatedGrid({ children, className = '', columns = 3 }: AnimatedGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid gap-4 ${gridClasses[columns]} ${className}`}>{children}</div>;
}

interface AnimatedButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

export function AnimatedButton({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  delay = 0,
}: AnimatedButtonProps) {
  const baseClasses = 'rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-lg';

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <motion.button
      className={buttonClasses}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
