import { io, Socket, Manager } from 'socket.io-client';
import { toast } from 'react-hot-toast';

export interface SocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
}

export class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private config: SocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionInProgress = false;

  private constructor(config: Partial<SocketConfig> = {}) {
    this.config = {
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000',
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      ...config
    };
    this.maxReconnectAttempts = this.config.reconnectionAttempts || 5;
  }

  public static getInstance(config?: Partial<SocketConfig>): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager(config);
    }
    return SocketManager.instance;
  }

  public async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.connectionInProgress) {
      throw new Error('Socket connection already in progress');
    }

    this.connectionInProgress = true;

    try {
      // Initialize socket with configuration
      this.socket = io(this.config.url, {
        transports: ['websocket', 'polling'],
        reconnection: this.config.reconnection,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        reconnectionDelayMax: this.config.reconnectionDelayMax,
        timeout: this.config.timeout,
        autoConnect: false, // We'll connect manually
        forceNew: true, // Force a new connection
        upgrade: true, // Allow transport upgrade
        rememberUpgrade: true, // Remember transport upgrade
        path: '/socket.io', // Explicit socket.io path
        query: {
          client: 'web',
          version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
        }
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Connect the socket with transport fallback
      await this.attemptConnectionWithFallback();

      return this.socket;
    } catch (error) {
      this.connectionInProgress = false;
      throw error;
    }
  }

  private async attemptConnectionWithFallback(): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, this.config.timeout);

      // Try WebSocket first
      this.socket!.io.opts.transports = ['websocket'];

      const connectHandler = () => {
        clearTimeout(timeoutId);
        this.reconnectAttempts = 0;
        this.connectionInProgress = false;
        if (this.socket?.io) {
          this.socket.io.off('connect_error', connectErrorHandler);
        }
        resolve();
      };

      const connectErrorHandler = async (error: Error) => {
        console.warn('🏀 LaroHub: WebSocket connection failed, falling back to polling:', error.message);
        
        // If WebSocket fails, try polling
        if (this.socket?.io && this.socket.io.opts.transports[0] === 'websocket') {
          this.socket.io.opts.transports = ['polling'];
          try {
            await this.socket.connect();
          } catch (pollingError) {
            clearTimeout(timeoutId);
            if (this.socket.io) {
              this.socket.io.off('connect', connectHandler);
            }
            this.handleConnectionError(error);
            reject(error);
          }
        } else {
          // If polling also fails, give up
          clearTimeout(timeoutId);
          if (this.socket?.io) {
            this.socket.io.off('connect', connectHandler);
          }
          this.handleConnectionError(error);
          reject(error);
        }
      };

      // Use type assertion for event names
      (this.socket as any).once('connect', connectHandler);
      (this.socket as any).once('connect_error', connectErrorHandler);

      this.socket.connect();
    });
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🏀 LaroHub: Socket connected');
      toast.success('Connected to game server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🏀 LaroHub: Socket disconnected:', reason);
      toast.error('Disconnected from game server');
      this.handleDisconnect(reason);
    });

    this.socket.on('error', (error) => {
      console.error('🏀 LaroHub: Socket error:', error);
      toast.error('Game server connection error');
      this.handleError(error);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🏀 LaroHub: Attempting to reconnect (${attemptNumber}/${this.maxReconnectAttempts})`);
      toast.loading(`Reconnecting to game server (${attemptNumber}/${this.maxReconnectAttempts})`);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🏀 LaroHub: Socket reconnected after', attemptNumber, 'attempts');
      toast.success('Reconnected to game server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🏀 LaroHub: Socket reconnection error:', error);
      this.handleReconnectionError(error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🏀 LaroHub: Socket reconnection failed after all attempts');
      toast.error('Failed to reconnect to game server');
      this.handleReconnectionFailed();
    });
  }

  private handleConnectionError(error: Error): void {
    console.error('🏀 LaroHub: Socket connection error:', error);
    
    // Check if it's a WebSocket-specific error
    if (error.message.includes('websocket')) {
      console.warn('🏀 LaroHub: WebSocket connection failed, will retry with polling');
      toast.error('Connection issue detected, switching to alternative connection method');
    } else {
      toast.error('Failed to connect to game server');
    }
    
    this.attemptReconnect();
  }

  private handleDisconnect(reason: string): void {
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, attempt to reconnect
      this.attemptReconnect();
    }
  }

  private handleError(error: Error): void {
    console.error('🏀 LaroHub: Socket error:', error);
    // Don't attempt reconnect on general errors
    // Let the socket.io client handle reconnection
  }

  private handleReconnectionError(error: Error): void {
    console.error('🏀 LaroHub: Socket reconnection error:', error);
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleReconnectionFailed();
    }
  }

  private handleReconnectionFailed(): void {
    console.error('🏀 LaroHub: Socket reconnection failed after all attempts');
    toast.error('Failed to reconnect to game server. Please refresh the page.');
    this.cleanup();
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🏀 LaroHub: Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      (this.config.reconnectionDelay || 1000) * Math.pow(2, this.reconnectAttempts),
      this.config.reconnectionDelayMax || 5000
    );

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('🏀 LaroHub: Reconnection attempt failed:', error);
        this.reconnectAttempts++;
        this.attemptReconnect();
      }
    }, delay);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket = null;
    }

    this.reconnectAttempts = 0;
    this.connectionInProgress = false;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public isConnecting(): boolean {
    return this.connectionInProgress;
  }

  public emit(event: string, ...args: any[]): void {
    if (!this.socket?.connected) {
      console.warn('🏀 LaroHub: Cannot emit event, socket not connected');
      return;
    }
    this.socket.emit(event, ...args);
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('🏀 LaroHub: Cannot add listener, socket not initialized');
      return;
    }
    this.socket.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('🏀 LaroHub: Cannot remove listener, socket not initialized');
      return;
    }
    this.socket.off(event, callback);
  }
}

// Export singleton instance
export const socketManager = SocketManager.getInstance(); 