import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  label,
  error,
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full flex flex-col gap-1.5" id={`${inputId}-container`}>
      {label ? (
        <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400" id={`${inputId}-label`}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow disabled:bg-slate-50 disabled:text-slate-500',
          error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : '',
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-rose-600 font-medium" id={`${inputId}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  );
};
