import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  labelClassName?: string;
}

export default function Input({
  label,
  error,
  leadingIcon,
  labelClassName = '',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1.5 text-teal-700 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            {leadingIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full py-2.5 border rounded-lg bg-gray-50 transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent
            ${leadingIcon ? 'pl-10 pr-4' : 'px-4'}
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
