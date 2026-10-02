import { useState } from "react";
import type { JSX, SubmitEvent } from "react";
import { todayISO } from "../utils/date.ts";

interface BudgetInjectionFormProps {
  onSubmit: (data: { amount: number; date: string }) => void;
}

export function BudgetInjectionForm({ onSubmit }: BudgetInjectionFormProps): JSX.Element {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsed = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onSubmit({ amount: parsed, date });
  }

  const isValid =
    Number.isFinite(Number(amount.replace(",", "."))) && Number(amount.replace(",", ".")) > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Valor extra (R$)
        </span>
        <input
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Ex: 500,00"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <span className="text-xs text-slate-400">
          O valor entra na soma usada para recalcular sua média diária do mês.
        </span>
      </label>

      <button
        type="submit"
        disabled={!isValid}
        className="mt-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        Adicionar valor extra
      </button>
    </form>
  );
}
