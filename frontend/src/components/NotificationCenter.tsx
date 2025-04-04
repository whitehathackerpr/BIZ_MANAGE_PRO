import React from 'react';
import { useStore } from '../providers/StoreProvider';
import { Button } from './ui/Button';
import { Bell } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { state, dispatch } = useStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleRemoveNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {state.notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {state.notifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="mt-2 space-y-2">
              {state.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : notification.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : notification.type === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {notification.message}
                    </p>
                    <button
                      onClick={() => handleRemoveNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {state.notifications.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 