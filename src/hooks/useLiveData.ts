import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db.ts";
import type { BudgetPeriod, Category, Expense, Goal } from "../db/db.ts";

export function useCategories(): Category[] {
  return useLiveQuery(() => db.categories.orderBy("name").toArray(), [], []);
}

export function useGoals(): Goal[] {
  return useLiveQuery(() => db.goals.orderBy("priority").toArray(), [], []);
}

export function useExpensesInRange(startISO: string, endISO: string): Expense[] {
  return useLiveQuery(
    async () => {
      const results = await db.expenses
        .where("date")
        .between(startISO, endISO, true, true)
        .sortBy("date");
      return results.toReversed();
    },
    [startISO, endISO],
    [],
  );
}

export function useBudgetPeriod(year: number, month: number): BudgetPeriod | undefined {
  return useLiveQuery(
    () => db.budgetPeriods.where({ year, month }).first(),
    [year, month],
    undefined,
  );
}

export function useAllBudgetPeriods(): BudgetPeriod[] {
  return useLiveQuery(
    // Dexie's Collection#reverse() flips cursor order; it isn't Array#reverse().
    // oxlint-disable-next-line unicorn/no-array-reverse
    () => db.budgetPeriods.orderBy("[year+month]").reverse().toArray(),
    [],
    [],
  );
}
