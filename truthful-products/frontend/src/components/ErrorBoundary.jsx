import React from 'react';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { Button, Card } from './ui';

/**
 * Error Boundary Component
 * Catches React errors and displays a friendly error page
 * Prevents white screen of death!
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // TODO: Send to error tracking service (Sentry)
    // if (window.Sentry) {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/'; // Navigate to home
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <Card className="p-8 max-w-lg w-full">
            <div className="text-center">
              {/* Error icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              
              {/* Error message */}
              <h1 className="text-3xl font-black text-ink mb-3">
                משהו השתבש
              </h1>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                קרתה שגיאה לא צפויה באפליקציה. אנחנו כבר עובדים על זה!
                אנא נסה לרענן את הדף או לחזור לדף הבית.
              </p>
              
              {/* Dev mode error details */}
              {import.meta.env.MODE === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-red-600 mb-2 hover:text-red-700">
                    פרטי שגיאה (dev mode only) 🔍
                  </summary>
                  <div className="text-xs bg-red-50 p-4 rounded-xl overflow-auto max-h-64 border border-red-100">
                    <div className="font-bold text-red-800 mb-2">Error:</div>
                    <pre className="text-red-700 mb-3 whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                    
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <div className="font-bold text-red-800 mb-2">Component Stack:</div>
                        <pre className="text-red-700 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRefresh}
                  leftIcon={<RefreshCw className="h-5 w-5" />}
                  className="flex-1"
                  variant="primary"
                >
                  רענן דף
                </Button>
                <Button
                  onClick={this.handleReset}
                  leftIcon={<Home className="h-5 w-5" />}
                  className="flex-1"
                  variant="secondary"
                >
                  חזור לדף הבית
                </Button>
              </div>
              
              {/* Help text */}
              <p className="mt-6 text-sm text-slate-500">
                אם הבעיה נמשכת, אנא צור קשר עם התמיכה
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
