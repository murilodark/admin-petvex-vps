import React from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  id,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none rounded-[4px]';
  
  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs',
    outline: 'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] tracking-widest',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm tracking-widest',
  };

  const buttonId = id || `btn-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <button
      id={buttonId}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" id={`${buttonId}-spinner`}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};
