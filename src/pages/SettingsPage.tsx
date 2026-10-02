import { useRef, useState } from "react";
import type { ChangeEvent, JSX } from "react";
import { db } from "../db/db.ts";
import { useBudgetPeriod } from "../hooks/useLiveData.ts";
import { useTheme } from "../hooks/useTheme.ts";
import { monthLabel } from "../utils/date.ts";
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

async function handleExport(): Promise<void> {
  const payload = await exportBackup();
  downloadBackupFile(payload);
}

async function resetAllData(): Promise<void> {
  const confirmed = window.confirm(
    "Isso vai apagar TODOS os dados (categorias, gastos, metas e orçamentos). Esta ação não pode ser desfeita. Continuar?",
  );
  if (!confirmed) return;
  await db.transaction("rw", [db.categories, db.expenses, db.goals, db.budgetPeriods], async () => {
    await Promise.all([
      db.categories.clear(),
      db.expenses.clear(),
      db.goals.clear(),
      db.budgetPeriods.clear(),
    ]);
  });
}

export function SettingsPage(): JSX.Element {
  const [now] = useState(() => new Date());
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const period = useBudgetPeriod(year, month);
  const { theme, toggleTheme } = useTheme();
  const [editingBudget, setEditingBudget] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            onClick={() => void handleExport()}
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
          onClick={() => void resetAllData()}
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
          <BudgetForm initial={period} onSubmit={(data) => void handleBudgetSubmit(data)} />
        </Sheet>
      )}
    </div>
  );
}
