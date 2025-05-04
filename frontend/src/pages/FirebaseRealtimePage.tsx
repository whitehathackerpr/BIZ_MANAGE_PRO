import React, { useEffect, useState } from 'react';

const WEBSOCKET_URL =
  window.location.protocol === 'https:'
    ? `wss://${window.location.host}/api/v1/firebase/ws/notifications`
    : `ws://${window.location.host}/api/v1/firebase/ws/notifications`;

const FirebaseRealtimePage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      setMessages((prev) => [event.data, ...prev]);
    };
    return () => ws.close();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Real-Time Notifications (WebSocket Demo)</h2>
      <div className="mb-4">
        {connected ? (
          <span className="text-green-600">Connected to WebSocket</span>
        ) : (
          <span className="text-red-600">Disconnected</span>
        )}
      </div>
      {messages.length > 0 && (
        <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <strong>Notification:</strong> {messages[0]}
        </div>
      )}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">All Notifications</h3>
        <ul className="space-y-2">
          {messages.map((msg, idx) => (
            <li key={idx} className="text-gray-700">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FirebaseRealtimePage; 