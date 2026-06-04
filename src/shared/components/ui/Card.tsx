import React from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  extra,
  id,
  ...props
}) => {
  const cardId = id || `card-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div
      id={cardId}
      className={cn('bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden', className)}
      {...props}
    >
      {title || subtitle || extra ? (
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between" id={`${cardId}-header`}>
          <div>
            {title ? (
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900" id={`${cardId}-title`}>
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase" id={`${cardId}-subtitle`}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {extra ? (
            <div id={`${cardId}-extra`}>
              {extra}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="p-6" id={`${cardId}-content`}>
        {children}
      </div>
    </div>
  );
};
