import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  error,
  ...props
}) => {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
}; 