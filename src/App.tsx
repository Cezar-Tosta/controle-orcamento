import { useEffect, useState } from "react";
import type { ComponentType, JSX } from "react";
import { seedDefaultCategories } from "./db/db.ts";
import type { TabKey } from "./types/index.ts";
import { catchErrors } from "./utils/errors.ts";
import { BottomNav } from "./components/BottomNav.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ExpensesPage } from "./pages/ExpensesPage.tsx";
import { GoalsPage } from "./pages/GoalsPage.tsx";
import { CategoriesPage } from "./pages/CategoriesPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";

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
    catchErrors(seedDefaultCategories());
  }, []);

  const Page = PAGES[tab];

  return (
    <div className="safe-top min-h-full">
      <ErrorBoundary>
        <Page />
      </ErrorBoundary>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
