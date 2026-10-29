import { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      id,
      className = '',
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`block w-full rounded-lg border text-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed ${
              leftAddon ? 'pl-9' : 'pl-3.5'
            } ${rightAddon ? 'pr-9' : 'pr-3.5'} py-2 ${
              error
                ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-zinc-300 text-zinc-900 bg-white focus:border-zinc-900 focus:ring-zinc-900/10'
            } ${className}`}
            {...props}
          />
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
