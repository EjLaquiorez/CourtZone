import { useEffect, useCallback } from 'react';
import { socketManager } from './socket-manager';

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError
  } = options;

  // Connect to socket when component mounts
  useEffect(() => {
    if (autoConnect) {
      socketManager.connect().catch((error) => {
        console.error('🏀 LaroHub: Failed to connect socket:', error);
        onError?.(error);
      });
    }

    // Set up event listeners
    if (onConnect) {
      socketManager.on('connect', onConnect);
    }
    if (onDisconnect) {
      socketManager.on('disconnect', onDisconnect);
    }
    if (onError) {
      socketManager.on('error', onError);
    }

    // Cleanup on unmount
    return () => {
      if (onConnect) {
        socketManager.off('connect', onConnect);
      }
      if (onDisconnect) {
        socketManager.off('disconnect', onDisconnect);
      }
      if (onError) {
        socketManager.off('error', onError);
      }
      socketManager.disconnect();
    };
  }, [autoConnect, onConnect, onDisconnect, onError]);

  // Wrapper functions for socket operations
  const emit = useCallback((event: string, data: any) => {
    socketManager.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketManager.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketManager.off(event, callback);
  }, []);

  const connect = useCallback(async () => {
    try {
      await socketManager.connect();
    } catch (error) {
      console.error('🏀 LaroHub: Failed to connect:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
  }, []);

  return {
    isConnected: socketManager.isConnected(),
    emit,
    on,
    off,
    connect,
    disconnect
  };
} 