// Real-time WebSocket service using Socket.IO
import React from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useGameStore } from '@/lib/stores/game-store';
import { useNotificationStore, createNotification, showBrowserNotification } from '@/lib/stores/notification-store';

export interface SocketEvents {
  // Game events
  'game:updated': (game: any) => void;
  'game:joined': (data: { gameId: string; teamId: string; userId: string }) => void;
  'game:left': (data: { gameId: string; teamId: string; userId: string }) => void;
  'game:started': (data: { gameId: string; startTime: Date }) => void;
  'game:ended': (data: { gameId: string; result: any }) => void;
  'game:cancelled': (data: { gameId: string; reason: string }) => void;

  // Live game events
  'live:score_update': (data: { gameId: string; hostScore: number; opponentScore: number }) => void;
  'live:quarter_change': (data: { gameId: string; quarter: number }) => void;
  'live:timeout': (data: { gameId: string; team: string; timeoutsLeft: number }) => void;
  'live:foul': (data: { gameId: string; playerId: string; foulType: string }) => void;

  // Team events
  'team:updated': (team: any) => void;
  'team:member_joined': (data: { teamId: string; userId: string; role: string }) => void;
  'team:member_left': (data: { teamId: string; userId: string }) => void;
  'team:invitation': (invitation: any) => void;

  // Chat events
  'chat:message': (message: any) => void;
  'chat:typing': (data: { userId: string; isTyping: boolean }) => void;

  // Notification events
  'notification:new': (notification: any) => void;
  'notification:read': (data: { notificationId: string }) => void;

  // User events
  'user:online': (data: { userId: string; status: 'online' | 'offline' }) => void;
  'user:location_update': (data: { userId: string; latitude: number; longitude: number }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor() {
    this.setupEventListeners();
  }

  // Initialize socket connection
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.isConnecting = true;

      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003';

      this.socket = io(socketUrl, {
        auth: {
          token: token || useAuthStore.getState().tokens?.accessToken,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.setupEventHandlers();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnecting = false;
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnecting = false;

        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.handleReconnect();
        }
      });
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit event to server
  emit<K extends keyof SocketEvents>(event: K, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Join a room
  joinRoom(room: string): void {
    this.emit('join_room' as any, { room });
  }

  // Leave a room
  leaveRoom(room: string): void {
    this.emit('leave_room' as any, { room });
  }

  // Join game room for live updates
  joinGameRoom(gameId: string): void {
    this.joinRoom(`game:${gameId}`);
  }

  // Leave game room
  leaveGameRoom(gameId: string): void {
    this.leaveRoom(`game:${gameId}`);
  }

  // Join team room for team updates
  joinTeamRoom(teamId: string): void {
    this.joinRoom(`team:${teamId}`);
  }

  // Leave team room
  leaveTeamRoom(teamId: string): void {
    this.leaveRoom(`team:${teamId}`);
  }

  // Handle reconnection logic
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('🏀 LaroHub: Max reconnection attempts reached. Real-time features will be disabled.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🏀 LaroHub: Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      const token = useAuthStore.getState().tokens?.accessToken;
      if (token) {
        this.connect(token).catch((error) => {
          console.warn('🏀 LaroHub: Reconnection failed:', error.message);
        });
      }
    }, delay);
  }

  // Set up event listeners for store updates
  private setupEventListeners(): void {
    // Listen for auth changes
    useAuthStore.subscribe(
      (state) => state.tokens,
      (tokens) => {
        if (tokens?.accessToken && !this.isConnected()) {
          this.connect(tokens.accessToken).catch(console.error);
        } else if (!tokens && this.isConnected()) {
          this.disconnect();
        }
      }
    );
  }

  // Set up socket event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Game events
    this.socket.on('game:updated', (game) => {
      useGameStore.getState().updateGame(game.id, game);
    });

    this.socket.on('game:joined', (data) => {
      const notification = createNotification(
        'game_invite',
        'Game Joined',
        `A player joined your game`,
        data
      );
      useNotificationStore.getState().addNotification(notification);
    });

    this.socket.on('game:started', (data) => {
      useGameStore.getState().updateGame(data.gameId, {
        status: 'in_progress',
        scheduledTime: data.startTime,
      });

      showBrowserNotification('Game Started', {
        body: 'Your game has started!',
        tag: `game-${data.gameId}`,
      });
    });

    // Live game events
    this.socket.on('live:score_update', (data) => {
      useGameStore.getState().updateLiveGame(data.gameId, {
        hostScore: data.hostScore,
        opponentScore: data.opponentScore,
      });
    });

    this.socket.on('live:quarter_change', (data) => {
      useGameStore.getState().updateLiveGame(data.gameId, {
        quarter: data.quarter,
      });
    });

    // Notification events
    this.socket.on('notification:new', (notification) => {
      useNotificationStore.getState().addNotification(notification);

      // Show browser notification if enabled
      const preferences = useNotificationStore.getState().preferences;
      if (preferences.push[notification.type as keyof typeof preferences.push]) {
        showBrowserNotification(notification.title, {
          body: notification.message,
          tag: notification.id,
          data: notification.data,
        });
      }
    });

    // User presence events
    this.socket.on('user:online', (data) => {
      console.log(`User ${data.userId} is now ${data.status}`);
      // Update user presence in relevant stores
    });

    // Chat events
    this.socket.on('chat:message', (message) => {
      // Handle chat messages
      console.log('New chat message:', message);
    });

    this.socket.on('chat:typing', (data) => {
      // Handle typing indicators
      console.log('User typing:', data);
    });
  }
}

// Create singleton instance
export const socketService = new SocketService();

// React hook for socket connection status
export const useSocket = () => {
  const [isConnected, setIsConnected] = React.useState(socketService.isConnected());
  const [connectionError, setConnectionError] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  React.useEffect(() => {
    // Update connection status when socket state changes
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    // Set up interval to check connection status
    const interval = setInterval(checkConnection, 1000);

    // Listen for socket events if socket exists
    if (socketService.socket) {
      const socket = socketService.socket;

      const handleConnect = () => {
        setIsConnected(true);
        setConnectionError(null);
        setIsConnecting(false);
        console.log('🏀 LaroHub: Socket connected successfully');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        setIsConnecting(false);
        console.log('🏀 LaroHub: Socket disconnected');
      };

      const handleConnectError = (error: any) => {
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(error.message || 'Connection failed');
        console.error('🏀 LaroHub: Socket connection error:', error);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
        clearInterval(interval);
      };
    }

    return () => clearInterval(interval);
  }, []);

  const connect = React.useCallback(async (token?: string) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      await socketService.connect(token);
    } catch (error) {
      setConnectionError((error as Error).message);
      setIsConnecting(false);
      throw error;
    }
  }, []);

  const disconnect = React.useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
  }, []);

  return {
    socket: socketService,
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    emit: socketService.emit.bind(socketService),
    joinGameRoom: socketService.joinGameRoom.bind(socketService),
    leaveGameRoom: socketService.leaveGameRoom.bind(socketService),
    joinTeamRoom: socketService.joinTeamRoom.bind(socketService),
    leaveTeamRoom: socketService.leaveTeamRoom.bind(socketService),
  };
};

// Auto-connect when auth token is available (only in browser and when enabled)
if (typeof window !== 'undefined') {
  // Only auto-connect in production or when explicitly enabled
  const shouldAutoConnect = process.env.NODE_ENV === 'production' ||
                           process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';

  if (shouldAutoConnect) {
    // Delay auto-connect to avoid SSR issues
    setTimeout(() => {
      const { tokens } = useAuthStore.getState();
      if (tokens?.accessToken) {
        socketService.connect(tokens.accessToken).catch((error) => {
          console.warn('🏀 LaroHub: Auto-connect failed (this is expected in development):', error.message);
        });
      }
    }, 100);
  }
}
