import { useMemo } from "react";
import { useBudgetInjections, useBudgetPeriod, useExpensesInRange } from "./useLiveData.ts";
import { calculateBudgetStatus } from "../utils/budget.ts";
import type { BudgetStatus } from "../utils/budget.ts";
import { todayISO } from "../utils/date.ts";
import type { BudgetPeriod } from "../db/db.ts";

export interface CurrentBudget {
  period: BudgetPeriod | undefined;
  status: BudgetStatus | undefined;
  /** Sum of all extra amounts injected into this month, beyond the base budget. */
  injectionsTotal: number;
  /** period.totalAmount + injectionsTotal — what the daily average is actually based on. */
  effectiveTotal: number;
}

export function useCurrentBudgetStatus(year: number, month: number): CurrentBudget {
  const period = useBudgetPeriod(year, month);
  const injections = useBudgetInjections(year, month);
  const today = todayISO();
  const expenses = useExpensesInRange(
    period?.registeredOn ?? `${year}-${String(month).padStart(2, "0")}-01`,
    today,
  );

  const injectionsTotal = useMemo(
    () => injections.reduce((sum, injection) => sum + injection.amount, 0),
    [injections],
  );
  const effectiveTotal = (period?.totalAmount ?? 0) + injectionsTotal;

  const status = useMemo(() => {
    if (!period) return undefined;
    return calculateBudgetStatus({
      year: period.year,
      month: period.month,
      totalAmount: effectiveTotal,
      registeredOn: period.registeredOn,
      expenseAmounts: expenses.map((expense) => expense.amount),
    });
  }, [period, expenses, effectiveTotal]);

  return { period, status, injectionsTotal, effectiveTotal };
}
