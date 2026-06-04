import React from 'react';
import { cn } from '../../lib/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warn' | 'danger' | 'info' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'gray',
  id,
  ...props
}) => {
  const badgeId = id || `badge-${Math.random().toString(36).substring(2, 9)}`;
  
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-bold tracking-wider border';
  
  const variants = {
    success: 'bg-teal-50 text-teal-700 border-teal-200',
    warn: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-teal-50 text-teal-700 border-teal-200',
    gray: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      id={badgeId}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
