import { useRef, useState } from "react";
import type { ChangeEvent, JSX } from "react";
import { db } from "../db/db.ts";
import type { BudgetInjection } from "../db/db.ts";
import { useBudgetInjections, useBudgetPeriod } from "../hooks/useLiveData.ts";
import { useTheme } from "../hooks/useTheme.ts";
import { monthLabel, shortDateLabel } from "../utils/date.ts";
import { formatCurrency } from "../utils/format.ts";
import {
  downloadBackupFile,
  exportBackup,
  importBackup,
  isBackupPayload,
} from "../utils/backup.ts";
import { Icon } from "../components/Icon.tsx";
import { Sheet } from "../components/Sheet.tsx";
import { BudgetForm } from "../components/BudgetForm.tsx";
import { BudgetInjectionForm } from "../components/BudgetInjectionForm.tsx";
import { catchErrors } from "../utils/errors.ts";

async function handleExport(): Promise<void> {
  const payload = await exportBackup();
  downloadBackupFile(payload);
}

async function handleDeleteInjection(injection: BudgetInjection): Promise<void> {
  const confirmed = window.confirm(`Remover o valor extra de ${formatCurrency(injection.amount)}?`);
  if (!confirmed) return;
  await db.budgetInjections.delete(injection.id!);
}

async function resetAllData(): Promise<void> {
  const confirmed = window.confirm(
    "Isso vai apagar TODOS os dados (categorias, gastos, metas e orçamentos). Esta ação não pode ser desfeita. Continuar?",
  );
  if (!confirmed) return;
  await db.transaction(
    "rw",
    [db.categories, db.expenses, db.goals, db.budgetPeriods, db.budgetInjections],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.expenses.clear(),
        db.goals.clear(),
        db.budgetPeriods.clear(),
        db.budgetInjections.clear(),
      ]);
    },
  );
}

export function SettingsPage(): JSX.Element {
  const [now] = useState(() => new Date());
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const period = useBudgetPeriod(year, month);
  const injections = useBudgetInjections(year, month);
  const { theme, toggleTheme } = useTheme();
  const [editingBudget, setEditingBudget] = useState(false);
  const [addingInjection, setAddingInjection] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const injectionsTotal = injections.reduce((sum, injection) => sum + injection.amount, 0);

  async function handleBudgetSubmit(data: {
    totalAmount: number;
    registeredOn: string;
  }): Promise<void> {
    if (period) {
      await db.budgetPeriods.update(period.id!, data);
    } else {
      await db.budgetPeriods.add({
        year,
        month,
        ...data,
        createdAt: new Date().toISOString(),
      });
    }
    setEditingBudget(false);
  }

  async function handleInjectionSubmit(data: { amount: number; date: string }): Promise<void> {
    await db.budgetInjections.add({
      year,
      month,
      ...data,
      createdAt: new Date().toISOString(),
    });
    setAddingInjection(false);
  }

  function handleImportClick(): void {
    setImportError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (!isBackupPayload(parsed)) {
        setImportError("Arquivo inválido. Selecione um backup exportado por este app.");
        return;
      }
      const confirmed = window.confirm(
        "Isso vai substituir todos os dados atuais pelos dados do backup. Continuar?",
      );
      if (!confirmed) return;
      await importBackup(parsed);
    } catch {
      setImportError("Não foi possível ler o arquivo selecionado.");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Ajustes</h1>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Orçamento de {monthLabel(year, month)}
        </h2>
        {period ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {formatCurrency(period.totalAmount)} cadastrados em{" "}
            {period.registeredOn.split("-").toReversed().join("/")}
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Nenhum orçamento cadastrado para este mês ainda.
          </p>
        )}
        <button
          type="button"
          onClick={() => setEditingBudget(true)}
          className="mt-3 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          {period ? "Editar orçamento" : "Cadastrar orçamento"}
        </button>

        {period && (
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Valores extras no mês
              </h3>
              <button
                type="button"
                onClick={() => setAddingInjection(true)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                Adicionar
              </button>
            </div>

            {injections.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1.5">
                {injections.map((injection) => (
                  <li key={injection.id} className="flex items-center gap-2 text-sm">
                    <span className="min-w-0 flex-1 text-slate-600 dark:text-slate-300">
                      {shortDateLabel(injection.date)}
                    </span>
                    <span className="tabular-nums text-slate-800 dark:text-slate-100">
                      + {formatCurrency(injection.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => catchErrors(handleDeleteInjection(injection))}
                      className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                      aria-label="Remover valor extra"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                <li className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5 text-sm font-semibold dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-200">Total efetivo</span>
                  <span className="tabular-nums text-slate-900 dark:text-slate-50">
                    {formatCurrency(period.totalAmount + injectionsTotal)}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                Recebeu um dinheiro extra no meio do mês? Adicione aqui para a média diária ser
                recalculada.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Tema</h2>
          <p className="text-xs text-slate-400">Claro ou escuro, salvo neste aparelho.</p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          <Icon name={theme === "dark" ? "moon" : "sun"} className="h-4 w-4" />
          {theme === "dark" ? "Escuro" : "Claro"}
        </button>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Backup dos dados
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Seus dados ficam só neste aparelho. Exporte um arquivo para guardar uma cópia ou mover
          para outro celular.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => catchErrors(handleExport())}
            className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <Icon name="download" className="h-4 w-4" />
            Exportar
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <Icon name="upload" className="h-4 w-4" />
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
          />
        </div>
        {importError && <p className="mt-2 text-xs text-rose-600">{importError}</p>}
      </section>

      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950">
        <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">Zona de risco</h2>
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
          Apaga todas as categorias, gastos, metas e orçamentos deste aparelho.
        </p>
        <button
          type="button"
          onClick={() => catchErrors(resetAllData())}
          className="mt-3 rounded-full bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500"
        >
          Apagar todos os dados
        </button>
      </section>

      {editingBudget && (
        <Sheet
          title={period ? "Editar orçamento" : "Cadastrar orçamento"}
          onClose={() => setEditingBudget(false)}
        >
          <BudgetForm initial={period} onSubmit={(data) => catchErrors(handleBudgetSubmit(data))} />
        </Sheet>
      )}

      {addingInjection && (
        <Sheet title="Adicionar valor extra" onClose={() => setAddingInjection(false)}>
          <BudgetInjectionForm onSubmit={(data) => catchErrors(handleInjectionSubmit(data))} />
        </Sheet>
      )}
    </div>
  );
}
