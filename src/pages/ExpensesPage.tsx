import { useMemo, useState } from "react";
import type { JSX } from "react";
import { db } from "../db/db.ts";
import type { Expense } from "../db/db.ts";
import { useCategories, useExpensesInRange } from "../hooks/useLiveData.ts";
import { daysInMonth, monthLabel, shortDateLabel } from "../utils/date.ts";
import { formatCurrency } from "../utils/format.ts";
import { Icon } from "../components/Icon.tsx";
import { Sheet } from "../components/Sheet.tsx";
import { ExpenseForm } from "../components/ExpenseForm.tsx";

async function handleDelete(expense: Expense): Promise<void> {
  const confirmed = window.confirm(`Excluir "${expense.description}"?`);
  if (!confirmed) return;
  await db.expenses.delete(expense.id!);
}

export function ExpensesPage(): JSX.Element {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [editing, setEditing] = useState<Expense | "new" | null>(null);

  const categories = useCategories();
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const startISO = `${year}-${String(month).padStart(2, "0")}-01`;
  const endISO = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth(year, month)).padStart(2, "0")}`;
  const expenses = useExpensesInRange(startISO, endISO);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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

  async function handleSubmit(data: {
    description: string;
    amount: number;
    categoryId: number;
    date: string;
  }): Promise<void> {
    if (editing === "new" || editing === null) {
      await db.expenses.add({ ...data, createdAt: new Date().toISOString() });
    } else {
      await db.expenses.update(editing.id!, data);
    }
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Gastos</h1>
        <button
          type="button"
          onClick={() => setEditing("new")}
          disabled={categories.length === 0}
          className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          <Icon name="plus" className="h-4 w-4" />
          Novo
        </button>
      </div>

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

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        Total do mês:{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {formatCurrency(total)}
        </span>
      </p>

      {categories.length === 0 && (
        <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Crie uma categoria antes de registrar gastos.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {expenses.map((expense) => {
          const category = categoryById.get(expense.categoryId);
          return (
            <li
              key={expense.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: category?.color ?? "#94a3b8" }}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {expense.description}
                  </p>
                  <p className="text-xs text-slate-400">
                    {category?.name ?? "Sem categoria"} · {shortDateLabel(expense.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="mr-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => setEditing(expense)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Editar"
                >
                  <Icon name="edit" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(expense)}
                  className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                  aria-label="Excluir"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
        {expenses.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Nenhum gasto registrado neste mês.
          </p>
        )}
      </ul>

      {editing !== null && (
        <Sheet
          title={editing === "new" ? "Novo gasto" : "Editar gasto"}
          onClose={() => setEditing(null)}
        >
          <ExpenseForm
            categories={categories}
            initial={editing === "new" ? undefined : editing}
            onSubmit={(data) => void handleSubmit(data)}
          />
        </Sheet>
      )}
    </div>
  );
}
