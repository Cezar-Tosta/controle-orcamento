import { useState } from "react";
import type { JSX, SubmitEvent } from "react";
import type { Category } from "../db/db.ts";

// Fixed categorical order (validated for colorblind-safe adjacency) plus a
// neutral gray for miscellaneous categories — see src/db/db.ts.
const COLOR_PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#4a3aa7", // violet
  "#e34948", // red
  "#64748b", // neutral gray
];

interface CategoryFormProps {
  initial?: Category | undefined;
  onSubmit: (data: { name: string; color: string }) => void;
}

export function CategoryForm({ initial, onSubmit }: CategoryFormProps): JSX.Element {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_PALETTE[0]!);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome</span>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex: Mercado"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cor</span>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-white transition dark:ring-offset-slate-900 ${
                color === swatch ? "ring-2 ring-slate-900 dark:ring-white" : ""
              }`}
              style={{ backgroundColor: swatch }}
              aria-label={`Escolher cor ${swatch}`}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        disabled={!name.trim()}
      >
        Salvar
      </button>
    </form>
  );
}
