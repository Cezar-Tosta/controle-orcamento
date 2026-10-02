import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere in the tree so a bug or a stale asset
 * after a deploy shows a recoverable screen instead of a blank/frozen app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Algo deu errado ao carregar esta tela.
        </p>
        <p className="text-xs text-slate-400">
          Seus dados continuam salvos no aparelho. Tente recarregar o app.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Recarregar
        </button>
      </div>
    );
  }
}
