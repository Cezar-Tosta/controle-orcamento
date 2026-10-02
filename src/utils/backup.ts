import { db } from "../db/db.ts";
import type { BudgetPeriod, Category, Expense, Goal } from "../db/db.ts";

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  categories: Category[];
  expenses: Expense[];
  goals: Goal[];
  budgetPeriods: BudgetPeriod[];
}

export async function exportBackup(): Promise<BackupPayload> {
  const [categories, expenses, goals, budgetPeriods] = await Promise.all([
    db.categories.toArray(),
    db.expenses.toArray(),
    db.goals.toArray(),
    db.budgetPeriods.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    expenses,
    goals,
    budgetPeriods,
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
    candidate["version"] === 1 &&
    Array.isArray(candidate["categories"]) &&
    Array.isArray(candidate["expenses"]) &&
    Array.isArray(candidate["goals"]) &&
    Array.isArray(candidate["budgetPeriods"])
  );
}

/** Replaces all local data with the contents of the backup. */
export async function importBackup(payload: BackupPayload): Promise<void> {
  await db.transaction("rw", [db.categories, db.expenses, db.goals, db.budgetPeriods], async () => {
    await Promise.all([
      db.categories.clear(),
      db.expenses.clear(),
      db.goals.clear(),
      db.budgetPeriods.clear(),
    ]);
    await Promise.all([
      db.categories.bulkAdd(payload.categories),
      db.expenses.bulkAdd(payload.expenses),
      db.goals.bulkAdd(payload.goals),
      db.budgetPeriods.bulkAdd(payload.budgetPeriods),
    ]);
  });
}
