'use client';

import { useState, useEffect } from 'react';

interface LazyComponentErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactElement;
}

export function LazyComponentErrorBoundary({ children, fallback }: LazyComponentErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Prevent the error from bubbling up to the window
      event.preventDefault();
      console.error('Lazy component error:', event.error);
      setError(event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent the rejection from bubbling up
      event.preventDefault();
      console.error('Unhandled promise rejection:', event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      setHasError(true);
    };

    window.addEventListener('error', handleError, true); // Use capture phase
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    console.warn('Lazy component failed to load:', error);
    return fallback;
  }

  return <>{children}</>;
} 