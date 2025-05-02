import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getNotifications,
  markRead,
  removeNotification,
} from '../features/notifications';
import { Notification } from '../features/notifications/notificationsAPI';
import { toast } from 'react-toastify';

const NotificationsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading, error } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleMarkRead = async (id: number) => {
    const result = await dispatch(markRead(id));
    if (markRead.fulfilled.match(result)) {
      toast.success('Notification marked as read.');
    } else {
      toast.error('Failed to mark as read.');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await dispatch(removeNotification(id));
    if (removeNotification.fulfilled.match(result)) {
      toast.success('Notification deleted.');
    } else {
      toast.error('Failed to delete notification.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {loading && <div>Loading...</div>}
      <ul className="bg-white rounded shadow divide-y">
        {notifications.map((n: Notification) => (
          <li key={n.id} className={`flex items-center justify-between px-4 py-3 ${n.read ? 'bg-gray-100' : ''}`}>
            <div>
              <span className={`font-semibold mr-2 ${n.type === 'error' ? 'text-red-600' : n.type === 'warning' ? 'text-yellow-600' : n.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>{n.type.toUpperCase()}</span>
              {n.message}
              <span className="ml-2 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              {!n.read && <button className="text-blue-600 hover:underline" onClick={() => handleMarkRead(n.id)}>Mark as Read</button>}
              <button className="text-red-600 hover:underline" onClick={() => handleDelete(n.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsList; 