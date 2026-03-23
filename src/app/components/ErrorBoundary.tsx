import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error('UI error captured:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">页面出现异常</h1>
            <p className="text-gray-500 mt-2">请刷新页面或稍后再试</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
