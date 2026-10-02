import { useMemo, useState } from "react";
import type { JSX } from "react";
import { db } from "../db/db.ts";
import type { Goal } from "../db/db.ts";
import { useGoals } from "../hooks/useLiveData.ts";
import { useCurrentBudgetStatus } from "../hooks/useBudgetStatus.ts";
import { findAffordableGoal, goalRemainingAmount } from "../utils/budget.ts";
import { formatCurrency } from "../utils/format.ts";
import { Icon } from "../components/Icon.tsx";
import { Sheet } from "../components/Sheet.tsx";
import { GoalForm } from "../components/GoalForm.tsx";
import { DepositForm } from "../components/DepositForm.tsx";

async function handleDelete(goal: Goal): Promise<void> {
  const confirmed = window.confirm(`Excluir a meta "${goal.name}"?`);
  if (!confirmed) return;
  await db.goals.delete(goal.id!);
}

export function GoalsPage(): JSX.Element {
  const [now] = useState(() => new Date());
  const goals = useGoals();
  const { status } = useCurrentBudgetStatus(now.getFullYear(), now.getMonth() + 1);

  const [editing, setEditing] = useState<Goal | "new" | null>(null);
  const [depositingFor, setDepositingFor] = useState<Goal | null>(null);

  const affordableGoal = useMemo(
    () => (status ? findAffordableGoal(goals, status.balance) : undefined),
    [goals, status],
  );

  async function handleSubmit(data: { name: string; targetAmount: number }): Promise<void> {
    if (editing === "new" || editing === null) {
      const maxPriority = goals.reduce((max, goal) => Math.max(max, goal.priority), 0);
      await db.goals.add({
        ...data,
        savedAmount: 0,
        priority: maxPriority + 1,
        createdAt: new Date().toISOString(),
      });
    } else {
      await db.goals.update(editing.id!, data);
    }
    setEditing(null);
  }

  async function handleDeposit(goal: Goal, amount: number): Promise<void> {
    const savedAmount = goal.savedAmount + amount;
    const completedAt =
      savedAmount >= goal.targetAmount ? new Date().toISOString() : goal.completedAt;
    await db.goals.update(goal.id!, { savedAmount, ...(completedAt ? { completedAt } : {}) });
    setDepositingFor(null);
  }

  async function move(goal: Goal, direction: -1 | 1): Promise<void> {
    const sorted = goals.toSorted((a, b) => a.priority - b.priority);
    const index = sorted.findIndex((g) => g.id === goal.id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const other = sorted[swapIndex]!;
    await db.transaction("rw", db.goals, async () => {
      await db.goals.update(goal.id!, { priority: other.priority });
      await db.goals.update(other.id!, { priority: goal.priority });
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Cofrinho</h1>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Icon name="plus" className="h-4 w-4" />
          Nova meta
        </button>
      </div>

      {status && status.balance > 0 && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          Você está com <strong>{formatCurrency(status.balance)}</strong> de saldo acumulado este
          mês.{" "}
          {affordableGoal ? (
            <>
              Dá para completar a meta <strong>{affordableGoal.name}</strong> agora (faltam{" "}
              {formatCurrency(goalRemainingAmount(affordableGoal))}).
            </>
          ) : (
            "Ainda não é suficiente para completar nenhuma meta pendente."
          )}
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {goals.map((goal, index) => {
          const remaining = goalRemainingAmount(goal);
          const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          const isAffordable = affordableGoal?.id === goal.id;
          return (
            <li
              key={goal.id}
              className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 ${
                isAffordable
                  ? "border-emerald-400 dark:border-emerald-600"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    #{goal.priority} {goal.name}
                    {goal.completedAt && <Icon name="check" className="h-4 w-4 text-emerald-500" />}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatCurrency(goal.savedAmount)} de {formatCurrency(goal.targetAmount)}
                    {!goal.completedAt && ` · faltam ${formatCurrency(remaining)}`}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => void move(goal, -1)}
                    disabled={index === 0}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-20 dark:hover:bg-slate-800"
                    aria-label="Subir prioridade"
                  >
                    <Icon name="arrowUp" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void move(goal, 1)}
                    disabled={index === goals.length - 1}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-20 dark:hover:bg-slate-800"
                    aria-label="Descer prioridade"
                  >
                    <Icon name="arrowDown" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex justify-end gap-1">
                {!goal.completedAt && (
                  <button
                    type="button"
                    onClick={() => setDepositingFor(goal)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    Guardar valor
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(goal)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Editar"
                >
                  <Icon name="edit" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(goal)}
                  className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                  aria-label="Excluir"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
        {goals.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Nenhuma meta cadastrada. Crie metas e ordene por prioridade.
          </p>
        )}
      </ul>

      {editing !== null && (
        <Sheet
          title={editing === "new" ? "Nova meta" : "Editar meta"}
          onClose={() => setEditing(null)}
        >
          <GoalForm
            initial={editing === "new" ? undefined : editing}
            onSubmit={(data) => void handleSubmit(data)}
          />
        </Sheet>
      )}

      {depositingFor !== null && (
        <Sheet
          title={`Guardar para "${depositingFor.name}"`}
          onClose={() => setDepositingFor(null)}
        >
          <DepositForm onSubmit={(amount) => void handleDeposit(depositingFor, amount)} />
        </Sheet>
      )}
    </div>
  );
}
