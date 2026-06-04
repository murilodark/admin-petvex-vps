import React from 'react';
import { cn } from '../../lib/cn';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  className = '',
  size = 'md',
  label = 'Carregando...',
  fullPage = false,
  id,
  ...props
}) => {
  const loadingId = id || `loading-${Math.random().toString(36).substring(2, 9)}`;

  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-[4px]',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3" id={`${loadingId}-spinner-container`}>
      <div
        id={`${loadingId}-spinner`}
        className={cn(
          'animate-spin rounded-full border-t-indigo-600 border-slate-200',
          sizeClasses[size],
          className
        )}
      />
      {label ? (
        <span className="text-sm font-medium text-slate-5050 animate-pulse" id={`${loadingId}-label`}>
          {label}
        </span>
      ) : null}
    </div>
  );

  if (fullPage) {
    return (
      <div
        id={loadingId}
        className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-[100] flex items-center justify-center"
        {...props}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      id={loadingId}
      className="flex items-center justify-center p-6 w-full"
      {...props}
    >
      {spinner}
    </div>
  );
};
