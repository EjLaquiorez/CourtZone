'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-red-500/20 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Error Icon */}
        <motion.div
          className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </motion.div>

        {/* Error Message */}
        <h2 className="text-2xl font-display font-bold text-white mb-4">
          Oops! Something went wrong
        </h2>
        
        <p className="text-primary-300 mb-6">
          We encountered an unexpected error. Don't worry, our team has been notified and we're working on a fix.
        </p>

        {/* Development Error Details */}
        {isDevelopment && (
          <motion.div
            className="bg-dark-200/50 rounded-lg p-4 mb-6 text-left"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center mb-2">
              <Bug className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-sm font-medium text-red-400">Development Error Details</span>
            </div>
            <div className="text-xs text-primary-300 font-mono">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="max-h-32 overflow-y-auto">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <GameButton
            variant="primary"
            onClick={resetError}
            icon={<RefreshCw className="w-4 h-4" />}
            className="flex-1"
          >
            Try Again
          </GameButton>
          
          <GameButton
            variant="secondary"
            onClick={() => window.location.href = '/dashboard'}
            icon={<Home className="w-4 h-4" />}
            className="flex-1"
          >
            Go Home
          </GameButton>
        </div>

        {/* Help Text */}
        <p className="text-xs text-primary-400 mt-4">
          If this problem persists, please contact our support team.
        </p>
      </motion.div>
    </div>
  );
}

// Basketball-themed error fallback
export function BasketballErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Basketball Animation */}
        <motion.div
          className="text-8xl mb-6"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          🏀
        </motion.div>

        <h2 className="text-3xl font-display font-bold text-white mb-4">
          Technical Foul!
        </h2>
        
        <p className="text-primary-300 mb-8">
          Looks like we hit a snag on the court. Let's get back in the game!
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <GameButton
            variant="primary"
            onClick={resetError}
            icon={<RefreshCw className="w-4 h-4" />}
            glow
          >
            Back to Game
          </GameButton>
          
          <GameButton
            variant="secondary"
            onClick={() => window.location.href = '/dashboard'}
            icon={<Home className="w-4 h-4" />}
          >
            Return to Court
          </GameButton>
        </div>
      </motion.div>
    </div>
  );
}

// Page-level error boundary wrapper
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={BasketballErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
