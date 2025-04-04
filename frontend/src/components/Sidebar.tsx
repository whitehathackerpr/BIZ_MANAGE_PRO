import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { LayoutDashboard, Users, ShoppingCart, Package, Settings, BarChart } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto">
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      location.pathname === item.href
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }`}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 