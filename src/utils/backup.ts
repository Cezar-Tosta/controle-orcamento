import { db } from "../db/db.ts";
import type { BudgetInjection, BudgetPeriod, Category, Expense, Goal } from "../db/db.ts";

export interface BackupPayload {
  version: 1 | 2;
  exportedAt: string;
  categories: Category[];
  expenses: Expense[];
  goals: Goal[];
  budgetPeriods: BudgetPeriod[];
  /** Added in version 2; absent (treated as []) when importing an older backup. */
  budgetInjections?: BudgetInjection[];
}

export async function exportBackup(): Promise<BackupPayload> {
  const [categories, expenses, goals, budgetPeriods, budgetInjections] = await Promise.all([
    db.categories.toArray(),
    db.expenses.toArray(),
    db.goals.toArray(),
    db.budgetPeriods.toArray(),
    db.budgetInjections.toArray(),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    categories,
    expenses,
    goals,
    budgetPeriods,
    budgetInjections,
  };
}

export function downloadBackupFile(payload: BackupPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `controle-orcamento-backup-${payload.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function isBackupPayload(value: unknown): value is BackupPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate["version"] === 1 || candidate["version"] === 2) &&
    Array.isArray(candidate["categories"]) &&
    Array.isArray(candidate["expenses"]) &&
    Array.isArray(candidate["goals"]) &&
    Array.isArray(candidate["budgetPeriods"])
  );
}

/** Replaces all local data with the contents of the backup. */
export async function importBackup(payload: BackupPayload): Promise<void> {
  await db.transaction(
    "rw",
    [db.categories, db.expenses, db.goals, db.budgetPeriods, db.budgetInjections],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.expenses.clear(),
        db.goals.clear(),
        db.budgetPeriods.clear(),
        db.budgetInjections.clear(),
      ]);
      await Promise.all([
        db.categories.bulkAdd(payload.categories),
        db.expenses.bulkAdd(payload.expenses),
        db.goals.bulkAdd(payload.goals),
        db.budgetPeriods.bulkAdd(payload.budgetPeriods),
        db.budgetInjections.bulkAdd(payload.budgetInjections ?? []),
      ]);
    },
  );
}
