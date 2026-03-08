'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { GameButton } from './game-button';

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
  error?: Error;
  resetError: () => void;
  goHome: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError, goHome }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-8 border border-red-500/30 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Error Icon */}
        <motion.div
          className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </motion.div>

        {/* Error Message */}
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Oops! Something went wrong 🏀
        </h1>
        <p className="text-primary-300 mb-6">
          Don't worry, even the best players miss shots sometimes. Let's get you back in the game!
        </p>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <motion.div
            className="bg-dark-200/50 rounded-lg p-4 mb-6 text-left"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-red-400 mb-2">Error Details (Development):</h3>
            <pre className="text-xs text-primary-300 overflow-auto max-h-32">
              {error.message}
            </pre>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <GameButton
            variant="primary"
            size="md"
            onClick={resetError}
            icon={<RefreshCw className="w-4 h-4" />}
            className="flex-1"
          >
            Try Again
          </GameButton>
          <GameButton
            variant="secondary"
            size="md"
            onClick={goHome}
            icon={<Home className="w-4 h-4" />}
            className="flex-1"
          >
            Go Home
          </GameButton>
        </div>

        {/* Basketball-themed footer */}
        <div className="mt-6 pt-4 border-t border-primary-400/20">
          <p className="text-xs text-primary-400">
            "You miss 100% of the shots you don't take" - Wayne Gretzky
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Hook for functional components to use error boundaries
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // In a real app, you might want to send this to an error reporting service
  };
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
