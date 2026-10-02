import { useState } from "react";
import type { JSX } from "react";
import { db } from "../db/db.ts";
import type { Category } from "../db/db.ts";
import { useCategories } from "../hooks/useLiveData.ts";
import { Icon } from "../components/Icon.tsx";
import { Sheet } from "../components/Sheet.tsx";
import { CategoryForm } from "../components/CategoryForm.tsx";

async function handleDelete(category: Category): Promise<void> {
  const expenseCount = await db.expenses.where("categoryId").equals(category.id!).count();
  if (expenseCount > 0) {
    const confirmed = window.confirm(
      `"${category.name}" tem ${expenseCount} gasto(s) registrado(s). Excluir mesmo assim? Os gastos não serão apagados, mas ficarão sem categoria.`,
    );
    if (!confirmed) return;
  }
  await db.categories.delete(category.id!);
}

export function CategoriesPage(): JSX.Element {
  const categories = useCategories();
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  async function handleSubmit(data: { name: string; color: string }): Promise<void> {
    if (editing === "new" || editing === null) {
      await db.categories.add({ ...data, icon: "tag", createdAt: new Date().toISOString() });
    } else {
      await db.categories.update(editing.id!, data);
    }
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Categorias</h1>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Icon name="plus" className="h-4 w-4" />
          Nova
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900"
          >
            <span
              className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {category.name}
            </span>
            <div className="flex flex-shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setEditing(category)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={`Editar ${category.name}`}
              >
                <Icon name="edit" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(category)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                aria-label={`Excluir ${category.name}`}
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {categories.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Nenhuma categoria ainda. Crie a primeira para começar a registrar gastos.
          </p>
        )}
      </ul>

      {editing !== null && (
        <Sheet
          title={editing === "new" ? "Nova categoria" : "Editar categoria"}
          onClose={() => setEditing(null)}
        >
          <CategoryForm
            initial={editing === "new" ? undefined : editing}
            onSubmit={(data) => void handleSubmit(data)}
          />
        </Sheet>
      )}
    </div>
  );
}
