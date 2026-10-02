import { useState } from "react";
import type { JSX, SubmitEvent } from "react";

interface DepositFormProps {
  onSubmit: (amount: number) => void;
}

export function DepositForm({ onSubmit }: DepositFormProps): JSX.Element {
  const [amount, setAmount] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsed = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onSubmit(parsed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Valor a guardar (R$)
        </span>
        <input
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0,00"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
      <button
        type="submit"
        className="mt-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Guardar no cofrinho
      </button>
    </form>
  );
}
