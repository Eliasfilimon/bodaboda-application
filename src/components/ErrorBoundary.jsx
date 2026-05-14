import { Component } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sand-50 text-navy-900 flex flex-col items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg w-full">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2 text-center">Something went wrong</h2>
            
            {/* Error Details */}
            <div className="mt-4 mb-6 bg-red-100 rounded-xl p-4 text-left">
              <p className="text-sm font-semibold text-red-800 mb-2">Error details:</p>
              <p className="text-sm text-red-700 font-mono break-words">
                {this.state.error?.toString() || 'Unknown error'}
              </p>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer">Stack trace</summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <p className="text-red-700 mb-6 text-center">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl transition"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold py-2 px-6 rounded-xl transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
