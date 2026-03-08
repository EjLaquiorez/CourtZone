'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/auth-store';
import { GameButton } from '@/components/ui/game-button';
import { useToastHelpers } from '@/components/ui/toast';

export function MockLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastHelpers();

  const handleMockLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'courtking@example.com',
          password: 'password123',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      toast.success('Logged in successfully!');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <motion.div
        className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-primary-400/20 max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Welcome to <span className="text-primary-500">LARO</span>
          </h1>
          <p className="text-primary-200">
            Basketball Community Platform
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-dark-200/50 rounded-lg border border-primary-400/10">
            <h3 className="font-medium text-primary-100 mb-2">Demo Login</h3>
            <p className="text-sm text-primary-300 mb-3">
              Click below to login with demo credentials
            </p>
            <div className="text-xs text-primary-400 space-y-1">
              <p>Email: courtking@example.com</p>
              <p>Password: password123</p>
            </div>
          </div>

          <GameButton
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onClick={handleMockLogin}
          >
            {isLoading ? 'Logging in...' : 'Login with Demo Account'}
          </GameButton>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-primary-400">
            This is a demo version with mock data
          </p>
        </div>
      </motion.div>
    </div>
  );
}
