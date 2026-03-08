'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

// Create auth context
interface AuthContextType {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  isAuthenticated: false,
  isLoading: false,
  error: null,
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Get auth state from store
  const {
    isAuthenticated,
    isLoading,
    error: authError,
    tokens,
    setLoading,
    setError,
    clearAuth
  } = useAuthStore();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout;

    const setupAuth = async () => {
      try {
        setLoading(true);

        // Check if we have stored tokens
        if (tokens?.accessToken) {
          // Set up API client with token
          apiClient.setAuthToken(tokens.accessToken);

          // Set up token refresh interval
          if (tokens.expiresIn) {
            // Refresh token 5 minutes before expiry
            const refreshTime = (tokens.expiresIn - 300) * 1000; // Convert to milliseconds
            refreshInterval = setInterval(async () => {
              try {
                // Attempt to refresh token
                const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
                  refreshToken: tokens.refreshToken
                });

                if (response.data?.accessToken) {
                  // Update tokens in store
                  useAuthStore.getState().setTokens({
                    ...tokens,
                    accessToken: response.data.accessToken,
                    expiresIn: response.data.expiresIn
                  });
                } else {
                  throw new Error('Invalid refresh response');
                }
              } catch (error) {
                console.error('Token refresh failed:', error);
                clearAuth();
                toast({
                  title: 'Session expired',
                  description: 'Please log in again to continue.',
                  variant: 'destructive',
                });
              }
            }, refreshTime);
          }
        }

        if (mounted) {
          setIsInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
          toast({
            title: 'Authentication Error',
            description: 'Failed to initialize authentication. Please try refreshing the page.',
            variant: 'destructive',
          });
          setLoading(false);
        }
      }
    };

    setupAuth();

    // Cleanup function
    return () => {
      mounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [tokens, setLoading, setError, clearAuth, toast]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      toast({
        title: 'Authentication Error',
        description: authError,
        variant: 'destructive',
      });
    }
  }, [authError, toast]);

  // Provide auth context to children
  const contextValue: AuthContextType = {
    isInitialized,
    isAuthenticated,
    isLoading,
    error: authError,
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
