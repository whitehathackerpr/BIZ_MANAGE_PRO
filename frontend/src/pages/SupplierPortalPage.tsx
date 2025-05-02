import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  fetchSupplierProfile,
  fetchSupplierOrderHistory,
  fetchSupplierLoyalty,
  submitSupplierFeedbackThunk,
  clearFeedbackSuccess,
  fetchSupplierMessages,
  sendSupplierMessageThunk,
  clearMessageSendSuccess,
  fetchSupplierAnalytics,
  fetchSupplierNotifications,
} from '../features/supplierPortal/supplierPortalSlice';
import { toast } from 'react-toastify';

const SupplierPortalPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, orders, loyalty, feedbackSuccess, messages, messageSendSuccess, analytics, notifications } = useSelector((state: RootState) => state.supplierPortal);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchSupplierProfile());
    dispatch(fetchSupplierOrderHistory());
    dispatch(fetchSupplierLoyalty());
    dispatch(fetchSupplierMessages());
    dispatch(fetchSupplierAnalytics());
    dispatch(fetchSupplierNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (feedbackSuccess) {
      toast.success('Feedback submitted!');
      setFeedback('');
      dispatch(clearFeedbackSuccess());
    }
  }, [feedbackSuccess, dispatch]);

  useEffect(() => {
    if (messageSendSuccess) {
      toast.success('Message sent!');
      setMessage('');
      dispatch(fetchSupplierMessages());
      dispatch(clearMessageSendSuccess());
    }
  }, [messageSendSuccess, dispatch]);

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(submitSupplierFeedbackThunk(feedback));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(sendSupplierMessageThunk(message));
  };

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Supplier Portal</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Profile</h3>
          {profile ? (
            <ul>
              <li><b>Name:</b> {profile.name}</li>
              <li><b>Email:</b> {profile.email}</li>
              {profile.phone && <li><b>Phone:</b> {profile.phone}</li>}
              {profile.company && <li><b>Company:</b> {profile.company}</li>}
            </ul>
          ) : <div>Loading...</div>}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Loyalty</h3>
          {loyalty ? (
            <ul>
              <li><b>Points:</b> {loyalty.points}</li>
              <li><b>Tier:</b> {loyalty.tier}</li>
            </ul>
          ) : <div>Loading...</div>}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Feedback</h3>
          <form onSubmit={handleFeedback}>
            <textarea
              className="input input-bordered w-full mb-2"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Your feedback..."
              required
            />
            <button className="btn btn-primary" type="submit">Submit</button>
          </form>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 flex items-center gap-2">Notifications
            <span className="relative">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0" style={{ display: notifications.some(n => !n.read) ? 'inline-block' : 'none' }}></span>
              <span className="ml-2">🔔</span>
            </span>
          </h3>
          <div className="max-h-32 overflow-y-auto">
            {notifications.length === 0 && <div className="text-gray-400">No notifications.</div>}
            {notifications.map(n => (
              <div key={n.id} className={`mb-2 ${n.read ? '' : 'font-bold'}`}>
                <div className="text-xs text-gray-500">{n.timestamp}</div>
                <div>{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Order History</h3>
        <table className="min-w-full table-auto border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Order #</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td className="border px-4 py-2">{order.order_number}</td>
                <td className="border px-4 py-2">{order.date}</td>
                <td className="border px-4 py-2">{order.status}</td>
                <td className="border px-4 py-2">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="font-semibold mb-2">Messages</h3>
        <div className="max-h-48 overflow-y-auto mb-2">
          {messages.map(msg => (
            <div key={msg.id} className="mb-2">
              <div className="text-xs text-gray-500">{msg.timestamp} - <b>{msg.sender}</b> to <b>{msg.recipient}</b></div>
              <div>{msg.content}</div>
            </div>
          ))}
          {messages.length === 0 && <div className="text-gray-400">No messages yet.</div>}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            className="input input-bordered flex-1"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            required
          />
          <button className="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
      {analytics && (
        <div className="bg-white p-4 rounded shadow mb-8">
          <h3 className="font-semibold mb-2">Analytics</h3>
          <div className="flex gap-8 mb-2">
            <div><b>Total Orders:</b> {analytics.totalOrders}</div>
            <div><b>Total Revenue:</b> ${analytics.totalRevenue}</div>
            <div><b>Avg Order Value:</b> ${analytics.avgOrderValue}</div>
          </div>
          <div>
            <b>Recent Activity:</b>
            <ul className="list-disc ml-6">
              {analytics.recentActivity.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPortalPage; 