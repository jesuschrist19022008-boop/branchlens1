import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'purple' | 'rose' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
    accent: 'bg-blue-50 text-blue-700 border-blue-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    purple: 'bg-violet-50 text-violet-700 border-violet-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    amber: 'bg-orange-50 text-orange-800 border-orange-200/80',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-tight font-medium',
    md: 'text-xs px-2.5 py-1 tracking-tight font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
