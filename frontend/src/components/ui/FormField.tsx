import React from 'react';
import { twMerge } from 'tailwind-merge';

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className,
}) => {
  return (
    <div className={twMerge('space-y-2', className)}>
      {children}
    </div>
  );
}; 