import { Component, ReactNode } from 'react';
import { Shield, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
          <div className="glass p-8 max-w-md text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-gray-400">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button onClick={() => window.location.href = '/'} className="btn-primary flex items-center gap-2 mx-auto">
              <RefreshCw size={16} /> Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
