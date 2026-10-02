import type { JSX, ReactNode } from "react";
import { Icon } from "./Icon.tsx";

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-slate-950/50 sm:items-center">
      <button type="button" aria-label="Fechar" className="absolute inset-0" onClick={onClose} />
      <div className="safe-bottom relative w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Fechar"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
