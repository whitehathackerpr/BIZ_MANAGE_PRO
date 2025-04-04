import React from 'react';
import { cn } from '../../lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const Form: React.FC<FormProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <form className={cn('space-y-4', className)} {...props}>
      {children}
    </form>
  );
};

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  className,
  label,
  error,
  children,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <FormMessage type="error">{error}</FormMessage>}
    </div>
  );
};

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  type?: 'error' | 'success' | 'info';
}

export const FormMessage: React.FC<FormMessageProps> = ({
  className,
  type = 'error',
  children,
  ...props
}) => {
  const styles = {
    error: 'text-red-600',
    success: 'text-green-600',
    info: 'text-blue-600',
  };

  return (
    <p
      className={cn('text-sm', styles[type], className)}
      {...props}
    >
      {children}
    </p>
  );
}; 