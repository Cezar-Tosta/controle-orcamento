import { useState } from "react";
import type { JSX, SubmitEvent } from "react";
import type { BudgetPeriod } from "../db/db.ts";
import { todayISO } from "../utils/date.ts";

interface BudgetFormProps {
  initial?: BudgetPeriod | undefined;
  onSubmit: (data: { totalAmount: number; registeredOn: string }) => void;
}

export function BudgetForm({ initial, onSubmit }: BudgetFormProps): JSX.Element {
  const [totalAmount, setTotalAmount] = useState(initial ? String(initial.totalAmount) : "");
  const [registeredOn, setRegisteredOn] = useState(initial?.registeredOn ?? todayISO());

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsed = Number(totalAmount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onSubmit({ totalAmount: parsed, registeredOn });
  }

  const isValid =
    Number.isFinite(Number(totalAmount.replace(",", "."))) &&
    Number(totalAmount.replace(",", ".")) > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Valor total disponível (R$)
        </span>
        <input
          autoFocus
          inputMode="decimal"
          value={totalAmount}
          onChange={(event) => setTotalAmount(event.target.value)}
          placeholder="Ex: 2400,00"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Dia do cadastro
        </span>
        <input
          type="date"
          value={registeredOn}
          onChange={(event) => setRegisteredOn(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <span className="text-xs text-slate-400">
          A média diária é calculada do dia do cadastro até o fim do mês.
        </span>
      </label>

      <button
        type="submit"
        disabled={!isValid}
        className="mt-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        Salvar orçamento do mês
      </button>
    </form>
  );
}
