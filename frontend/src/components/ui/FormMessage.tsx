import React from 'react';
import { twMerge } from 'tailwind-merge';

interface FormMessageProps {
  children: React.ReactNode;
  type?: 'error' | 'success' | 'info';
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({
  children,
  type = 'error',
  className,
}) => {
  const typeStyles = {
    error: 'text-red-500',
    success: 'text-green-500',
    info: 'text-blue-500',
  };

  return (
    <p className={twMerge('text-sm', typeStyles[type], className)}>
      {children}
    </p>
  );
}; 