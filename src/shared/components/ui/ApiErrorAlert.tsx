import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { apiErrorHelper } from '../../../common/helpers/api-error.helper';
import { cn } from '../../lib/cn';

interface ApiErrorAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: any;
  title?: string;
  message?: string;
  onClear?: () => void;
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({
  error,
  title,
  message,
  onClear,
  className = '',
  id,
  ...props
}) => {
  if (!error && !message) return null;

  const resolvedTitle = title || 'Não foi possível salvar.';
  const resolvedMessage = message || apiErrorHelper.getFriendlyErrorMessage(error);
  
  // Extract and format validation errors if any are returned
  const validationErrors = apiErrorHelper.extractFormErrors(error);
  const validationList = Object.entries(validationErrors);

  const alertId = id || `api-error-alert-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div
      id={alertId}
      className={cn(
        "bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-[4px] flex items-start gap-3 shadow-2xs font-sans animate-fade-in",
        className
      )}
      {...props}
    >
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
      <div className="flex-1 space-y-1">
        <h5 className="font-bold uppercase tracking-wider text-[11px] text-rose-800">
          {resolvedTitle}
        </h5>
        <div className="text-[11px] leading-relaxed text-rose-700 font-semibold">
          {resolvedMessage}
        </div>
        
        {validationList.length > 0 && (
          <ul className="list-disc list-inside mt-2 space-y-1 text-[11px] text-rose-600 font-normal border-t border-rose-150 pt-2">
            {validationList.map(([field, errText], idx) => (
              <li key={idx} className="leading-snug">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-rose-700">{field}: </span>
                {errText}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onClear && (
        <button
          onClick={onClear}
          type="button"
          className="p-1 text-rose-400 hover:text-rose-600 rounded-sm hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
