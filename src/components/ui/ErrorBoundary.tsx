import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center max-w-md px-4">
            <h1 className="text-lg font-semibold mb-2">오류가 발생했습니다</h1>
            <p className="text-sm text-gray-400 mb-4 break-all">
              {this.state.error?.message || '알 수 없는 오류'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
