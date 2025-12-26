import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD7979] focus:border-[#FD7979] transition-all ${
            error
              ? 'border-[#FD7979] focus:ring-[#FD7979] bg-[#FD7979]/5'
              : 'border-[#FEEAC9] hover:border-[#FDACAC] bg-white'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-[#FD7979]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD7979] focus:border-[#FD7979] transition-all resize-none ${
            error
              ? 'border-[#FD7979] focus:ring-[#FD7979] bg-[#FD7979]/5'
              : 'border-[#FEEAC9] hover:border-[#FDACAC] bg-white'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-[#FD7979]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
