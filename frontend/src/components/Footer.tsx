import React from 'react';
import { useI18n } from '../providers/I18nProvider';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} BizManage Pro. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 