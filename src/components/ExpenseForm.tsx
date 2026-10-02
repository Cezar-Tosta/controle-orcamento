import { useState } from "react";
import type { JSX, SubmitEvent } from "react";
import type { Category, Expense } from "../db/db.ts";
import { todayISO } from "../utils/date.ts";

interface ExpenseFormProps {
  categories: Category[];
  initial?: Expense | undefined;
  onSubmit: (data: {
    description: string;
    amount: number;
    categoryId: number;
    date: string;
  }) => void;
}

export function ExpenseForm({ categories, initial, onSubmit }: ExpenseFormProps): JSX.Element {
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState<number | "">(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(",", "."));
    if (!description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    if (categoryId === "") return;
    onSubmit({ description: description.trim(), amount: parsedAmount, categoryId, date });
  }

  const isValid =
    description.trim().length > 0 &&
    Number.isFinite(Number(amount.replace(",", "."))) &&
    Number(amount.replace(",", ".")) > 0 &&
    categoryId !== "";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</span>
        <input
          autoFocus
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex: Almoço"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor (R$)</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</span>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(Number(event.target.value))}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
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
