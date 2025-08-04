import { useCallback } from 'react';
import type { ErrorInfo } from 'react';

export function useErrorReporter() {
  return useCallback((error: Error, errorInfo?: ErrorInfo) => {
    import('@sentry/react')
      .then((Sentry) => {
        Sentry.captureException(error, { extra: errorInfo });
      })
      .catch(() => {
        console.error('Captured by ErrorBoundary:', error, errorInfo);
      });
  }, []);
}
