import { useMemo, useState } from "react";
import type { JSX } from "react";
import { useCategories, useExpensesInRange, useGoals } from "../hooks/useLiveData.ts";
import { useCurrentBudgetStatus } from "../hooks/useBudgetStatus.ts";
import { findAffordableGoal, goalRemainingAmount } from "../utils/budget.ts";
import { daysInMonth, monthLabel } from "../utils/date.ts";
import { formatCurrency } from "../utils/format.ts";
import type { CategoryTotal } from "../types/index.ts";
import { StatCard } from "../components/StatCard.tsx";
import { Icon } from "../components/Icon.tsx";
import { CategoryBreakdownChart } from "../components/charts/CategoryBreakdownChart.tsx";
import { DailySpendChart } from "../components/charts/DailySpendChart.tsx";
import type { DailySpendPoint } from "../components/charts/DailySpendChart.tsx";

export function DashboardPage(): JSX.Element {
  const [now] = useState(() => new Date());
  const [year, setYear] = useState(() => now.getFullYear());
  const [month, setMonth] = useState(() => now.getMonth() + 1);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const { period, status } = useCurrentBudgetStatus(year, month);
  const categories = useCategories();
  const goals = useGoals();

  const startISO = `${year}-${String(month).padStart(2, "0")}-01`;
  const endISO = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth(year, month)).padStart(2, "0")}`;
  const monthExpenses = useExpensesInRange(startISO, endISO);

  const categoryTotals = useMemo<CategoryTotal[]>(() => {
    const byCategory = new Map<number, number>();
    for (const expense of monthExpenses) {
      byCategory.set(
        expense.categoryId,
        (byCategory.get(expense.categoryId) ?? 0) + expense.amount,
      );
    }
    return categories
      .filter((category) => byCategory.has(category.id!))
      .map((category) => ({
        categoryId: category.id!,
        name: category.name,
        color: category.color,
        total: byCategory.get(category.id!)!,
      }));
  }, [monthExpenses, categories]);

  const dailySpend = useMemo<DailySpendPoint[]>(() => {
    const totalDays = daysInMonth(year, month);
    const lastDay = isCurrentMonth ? Math.min(now.getDate(), totalDays) : totalDays;
    const perDay = Array.from<number>({ length: lastDay }).fill(0);
    for (const expense of monthExpenses) {
      const day = Number(expense.date.slice(8, 10));
      if (day >= 1 && day <= lastDay) {
        perDay[day - 1] = (perDay[day - 1] ?? 0) + expense.amount;
      }
    }
    return perDay.map((amount, index) => ({ day: index + 1, amount }));
  }, [monthExpenses, year, month, isCurrentMonth, now]);

  const affordableGoal = useMemo(
    () => (status ? findAffordableGoal(goals, status.balance) : undefined),
    [goals, status],
  );

  function changeMonth(delta: number): void {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Painel</h1>

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Mês anterior"
        >
          <Icon name="arrowDown" className="h-4 w-4 rotate-90" />
        </button>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {monthLabel(year, month)}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Próximo mês"
        >
          <Icon name="arrowUp" className="h-4 w-4 rotate-90" />
        </button>
      </div>

      {!period ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          Nenhum orçamento cadastrado para {monthLabel(year, month)}. Cadastre em Ajustes para ver a
          média diária e o saldo.
        </div>
      ) : (
        status && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <StatCard label="Média diária" value={formatCurrency(status.dailyAverage)} />
              <StatCard
                label={status.balance >= 0 ? "Saldo acumulado" : "Acima da média"}
                value={formatCurrency(Math.abs(status.balance))}
                tone={status.balance >= 0 ? "positive" : "negative"}
                hint={status.balance >= 0 ? "abaixo do permitido" : "acima do permitido"}
              />
              <StatCard label="Gasto no período" value={formatCurrency(status.spentCumulative)} />
              <StatCard
                label="Resta no mês"
                value={formatCurrency(status.remainingBudget)}
                tone={status.remainingBudget >= 0 ? "neutral" : "negative"}
                hint={`${status.remainingDays} dia(s) restante(s)`}
              />
            </div>

            {status.balance > 0 && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                Saldo de <strong>{formatCurrency(status.balance)}</strong> acumulado.{" "}
                {affordableGoal ? (
                  <>
                    Dá para completar <strong>{affordableGoal.name}</strong> (faltam{" "}
                    {formatCurrency(goalRemainingAmount(affordableGoal))}).
                  </>
                ) : (
                  "Ainda não cobre nenhuma meta do cofrinho."
                )}
              </div>
            )}
          </>
        )
      )}

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Gastos por categoria
        </h2>
        <CategoryBreakdownChart data={categoryTotals} />
      </section>

      {status && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Gasto diário vs. média
          </h2>
          <DailySpendChart data={dailySpend} dailyAverage={status.dailyAverage} />
        </section>
      )}
    </div>
  );
}
