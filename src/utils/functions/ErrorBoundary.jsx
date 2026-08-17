// src/components/ErrorBoundary.jsx

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Component Crashed:", error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center gap-3 p-4 mt-3 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 rounded-lg">
                    {/* Warning Icon */}
                    <svg 
                        className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                        />
                    </svg>

                    {/* Content */}
                    <div className="flex-1">
                        <strong className="text-sm font-semibold text-red-700 dark:text-red-300">
                            Component Error:
                        </strong>
                        <span className="ml-1 text-sm text-red-600 dark:text-red-400">
                            There was an issue loading this content.
                        </span>
                        {this.state.error?.message && (
                            <div className="mt-1">
                                <small className="text-xs text-red-500 dark:text-red-400">
                                    {this.state.error.message}
                                </small>
                            </div>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="mt-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 hover:text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/50 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;