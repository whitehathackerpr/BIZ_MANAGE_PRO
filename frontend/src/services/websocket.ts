import useStore from '../store/useStore';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface SubscriptionMessage {
  type: 'subscribe' | 'unsubscribe';
  channel: string;
}

type MessageHandler = (payload: any) => void;

// Define a type for our store state that includes the properties we're using
interface StoreState {
  token: string;
  setSocket: (socket: WebSocket | null) => void;
  addNotification: (notification: any) => void;
}

class WebSocketService {
  private socket: WebSocket | null;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private handlers: Map<string, MessageHandler>;

  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.handlers = new Map();
  }

  connect(): void {
    const store = useStore.getState() as StoreState;
    const token = store.token;
    if (!token) return;

    // Use process.env safely with explicit type check
    const wsUrl = process.env['REACT_APP_WS_URL'] || 'ws://localhost:8000/ws';
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      const store = useStore.getState() as StoreState;
      store.setSocket(this.socket);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as WebSocketMessage;
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleDisconnect();
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(data: WebSocketMessage): void {
    const { type, payload } = data;
    const handler = this.handlers.get(type);
    if (handler) {
      handler(payload);
    }

    // Handle specific message types
    switch (type) {
      case 'notification':
        const store = useStore.getState() as StoreState;
        store.addNotification(payload);
        break;
      case 'order_update':
        // Handle order updates
        break;
      case 'inventory_update':
        // Handle inventory updates
        break;
      case 'analytics_update':
        // Handle analytics updates
        break;
    }
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribe(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'subscribe', channel: type } as SubscriptionMessage));
    }
  }

  unsubscribe(type: string): void {
    this.handlers.delete(type);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'unsubscribe', channel: type } as SubscriptionMessage));
    }
  }

  send(message: Record<string, any>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      const store = useStore.getState() as StoreState;
      store.setSocket(null);
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService; 