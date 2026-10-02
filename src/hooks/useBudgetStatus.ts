import { useMemo } from "react";
import { useBudgetPeriod, useExpensesInRange } from "./useLiveData.ts";
import { calculateBudgetStatus } from "../utils/budget.ts";
import type { BudgetStatus } from "../utils/budget.ts";
import { todayISO } from "../utils/date.ts";
import type { BudgetPeriod } from "../db/db.ts";

export interface CurrentBudget {
  period: BudgetPeriod | undefined;
  status: BudgetStatus | undefined;
}

export function useCurrentBudgetStatus(year: number, month: number): CurrentBudget {
  const period = useBudgetPeriod(year, month);
  const today = todayISO();
  const expenses = useExpensesInRange(
    period?.registeredOn ?? `${year}-${String(month).padStart(2, "0")}-01`,
    today,
  );

  const status = useMemo(() => {
    if (!period) return undefined;
    return calculateBudgetStatus({
      year: period.year,
      month: period.month,
      totalAmount: period.totalAmount,
      registeredOn: period.registeredOn,
      expenseAmounts: expenses.map((expense) => expense.amount),
    });
  }, [period, expenses]);

  return { period, status };
}
