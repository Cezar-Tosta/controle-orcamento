import type { JSX, ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  hint?: string;
  icon?: ReactNode;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "text-slate-900 dark:text-slate-50",
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-rose-600 dark:text-rose-400",
};

export function StatCard({
  label,
  value,
  tone = "neutral",
  hint,
  icon,
}: StatCardProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {icon}
      </div>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${TONE_CLASSES[tone]}`}>{value}</p>
      {hint !== undefined && (
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
}
