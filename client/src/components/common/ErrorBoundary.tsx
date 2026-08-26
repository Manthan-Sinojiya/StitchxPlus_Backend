import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border border-navy-100 p-8 rounded-3xl shadow-dropdown space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-navy-900">
                Something Went Unexpectedly Wrong
              </h2>
              <p className="text-sm text-navy-500 leading-relaxed">
                An unexpected application error occurred. Our tailoring team has been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-navy-950 text-gold-300 font-mono text-xs rounded-xl overflow-x-auto text-left max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={this.handleReload}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Page
              </Button>
              <Button
                variant="gold"
                fullWidth
                onClick={this.handleGoHome}
                leftIcon={<Home className="w-4 h-4" />}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
