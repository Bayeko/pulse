import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { useErrorReporter } from '@/hooks/use-error-reporter';
 codex/resolve-merge-conflicts-in-feature-branch
import { NODE_ENV } from '@/config';

import { getEnvVar } from '@/config';

const NODE_ENV = getEnvVar('NODE_ENV');
 main

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

interface BoundaryProps extends Props {
  onError: (error: Error, info: ErrorInfo) => void;
}

class ErrorBoundaryInner extends Component<BoundaryProps, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Don't worry, your connection with your partner is safe.
              </p>

              {NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-mono text-destructive">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <PulseButton onClick={() => window.location.reload()} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </PulseButton>
                <PulseButton
                  variant="ghost"
                  onClick={() => (window.location.href = '/dashboard')}
                  className="flex-1"
                >
                  Go Home
                </PulseButton>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }: Props) {
  const reportError = useErrorReporter();
  return <ErrorBoundaryInner onError={reportError}>{children}</ErrorBoundaryInner>;
}
