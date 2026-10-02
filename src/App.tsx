import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentType, JSX } from "react";
import { seedDefaultCategories } from "./db/db.ts";
import type { TabKey } from "./types/index.ts";
import { BottomNav } from "./components/BottomNav.tsx";
import { ExpensesPage } from "./pages/ExpensesPage.tsx";
import { GoalsPage } from "./pages/GoalsPage.tsx";
import { CategoriesPage } from "./pages/CategoriesPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";

// Charting (recharts) is the heaviest dependency, so the dashboard — the only
// page that needs it — is split into its own chunk instead of shipping on
// every first load of this offline-installed PWA.
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage.tsx").then((module) => ({ default: module.DashboardPage })),
);

const PAGES: Record<TabKey, ComponentType> = {
  dashboard: DashboardPage,
  expenses: ExpensesPage,
  goals: GoalsPage,
  categories: CategoriesPage,
  settings: SettingsPage,
};

export function App(): JSX.Element {
  const [tab, setTab] = useState<TabKey>("dashboard");

  useEffect(() => {
    void seedDefaultCategories();
  }, []);

  const Page = PAGES[tab];

  return (
    <div className="safe-top min-h-full">
      <Suspense fallback={<div className="p-4 text-sm text-slate-400">Carregando…</div>}>
        <Page />
      </Suspense>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
