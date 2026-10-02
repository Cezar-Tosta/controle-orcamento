import { useState } from "react";
import type { JSX, SubmitEvent } from "react";
import type { Goal } from "../db/db.ts";

interface GoalFormProps {
  initial?: Goal | undefined;
  onSubmit: (data: { name: string; targetAmount: number }) => void;
}

export function GoalForm({ initial, onSubmit }: GoalFormProps): JSX.Element {
  const [name, setName] = useState(initial?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : "");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsed = Number(targetAmount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(parsed) || parsed <= 0) return;
    onSubmit({ name: name.trim(), targetAmount: parsed });
  }

  const isValid =
    name.trim().length > 0 &&
    Number.isFinite(Number(targetAmount.replace(",", "."))) &&
    Number(targetAmount.replace(",", ".")) > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome da meta</span>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex: Viagem de férias"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Valor alvo (R$)
        </span>
        <input
          inputMode="decimal"
          value={targetAmount}
          onChange={(event) => setTargetAmount(event.target.value)}
          placeholder="0,00"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <button
        type="submit"
        disabled={!isValid}
        className="mt-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  );
}
