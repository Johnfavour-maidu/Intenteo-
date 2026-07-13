"use client"

import React from "react"

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-lg font-bold text-red-600">Something went wrong</h2>
          <pre className="mt-2 text-xs text-left bg-red-50 dark:bg-red-950/30 p-4 rounded-lg overflow-auto max-h-96">{this.state.error?.message}{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
