import type { JSX } from "react";
import type { TabKey } from "../types/index.ts";
import { Icon } from "./Icon.tsx";

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: ReadonlyArray<{
  key: TabKey;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
}> = [
  { key: "dashboard", label: "Painel", icon: "dashboard" },
  { key: "expenses", label: "Gastos", icon: "list" },
  { key: "goals", label: "Cofrinho", icon: "piggyBank" },
  { key: "categories", label: "Categorias", icon: "tag" },
  { key: "settings", label: "Ajustes", icon: "settings" },
];

export function BottomNav({ active, onChange }: BottomNavProps): JSX.Element {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <ul className="mx-auto flex max-w-lg justify-between px-1">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <li key={tab.key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(tab.key)}
                className={`flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon name={tab.icon} className="h-5 w-5" />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
