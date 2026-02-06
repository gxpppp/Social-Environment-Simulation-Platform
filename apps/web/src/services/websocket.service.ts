import { message } from 'antd';

// WebSocket连接状态
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// 消息处理器类型
type MessageHandler = (data: any) => void;

// WebSocket服务类
class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private statusHandlers: ((status: ConnectionStatus) => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isManualClose: boolean = false;

  // 获取WebSocket URL
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL || window.location.host;
    return `${protocol}//${host}/ws`;
  }

  // 连接WebSocket
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isManualClose = false;
    this.url = this.getWebSocketUrl();
    
    try {
      this.updateStatus('connecting');
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.updateStatus('error');
      this.attemptReconnect();
    }
  }

  // 设置事件处理器
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.updateStatus('connected');
      this.startHeartbeat();
      message.success('实时数据连接已建立');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.stopHeartbeat();
      
      if (!this.isManualClose) {
        this.updateStatus('disconnected');
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.updateStatus('error');
    };
  }

  // 处理接收到的消息
  private handleMessage(data: any): void {
    const { type, payload } = data;
    
    if (type && this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || [];
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });
    }

    // 处理所有消息类型的通用处理器
    const generalHandlers = this.messageHandlers.get('*') || [];
    generalHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('General message handler error:', error);
      }
    });
  }

  // 尝试重新连接
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      message.error('实时数据连接失败，请刷新页面重试');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  // 启动心跳
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, 30000); // 30秒心跳
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 更新连接状态
  private updateStatus(status: ConnectionStatus): void {
    this.statusHandlers.forEach(handler => handler(status));
  }

  // 发送消息
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // 订阅消息类型
  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    const handlers = this.messageHandlers.get(type)!;
    handlers.push(handler);

    // 返回取消订阅函数
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  // 订阅连接状态变化
  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.push(handler);
    
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  // 断开连接
  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.updateStatus('disconnected');
  }

  // 获取连接状态
  getStatus(): ConnectionStatus {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  // 是否已连接
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// 创建单例实例
export const wsService = new WebSocketService();

// 模拟WebSocket服务（用于开发测试）
class MockWebSocketService {
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private statusHandlers: ((status: ConnectionStatus) => void)[] = [];
  private interval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  connect(): void {
    console.log('Mock WebSocket connecting...');
    this.updateStatus('connecting');
    
    setTimeout(() => {
      this.isConnected = true;
      this.updateStatus('connected');
      this.startMockData();
      message.success('实时数据连接已建立（模拟模式）');
    }, 1000);
  }

  private startMockData(): void {
    // 模拟实时数据推送
    this.interval = setInterval(() => {
      const mockEvents = [
        {
          type: 'metrics',
          payload: {
            supportRate: 60 + Math.random() * 20,
            opposeRate: 20 + Math.random() * 10,
            neutralRate: 10 + Math.random() * 10,
            networkDensity: 0.3 + Math.random() * 0.1,
            timestamp: Date.now(),
          },
        },
        {
          type: 'event',
          payload: {
            id: `evt-${Date.now()}`,
            tick: Math.floor(Math.random() * 100),
            type: 'interaction',
            source: `Agent ${Math.floor(Math.random() * 50)}`,
            description: '模拟事件触发',
            impact: Math.random() * 0.5,
          },
        },
      ];

      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      this.handleMessage(randomEvent);
    }, 2000);
  }

  private handleMessage(data: any): void {
    const { type, payload } = data;
    
    if (type && this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || [];
      handlers.forEach(handler => handler(payload));
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.statusHandlers.forEach(handler => handler(status));
  }

  send(data: any): void {
    console.log('Mock WebSocket send:', data);
  }

  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    const handlers = this.messageHandlers.get(type)!;
    handlers.push(handler);

    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.push(handler);
    
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  disconnect(): void {
    this.isConnected = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.updateStatus('disconnected');
  }

  getStatus(): ConnectionStatus {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

// 导出模拟服务实例（开发环境使用）
export const mockWsService = new MockWebSocketService();

// 根据环境选择使用真实或模拟服务
export const useWebSocket = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? mockWsService : wsService;
};

export default WebSocketService;
