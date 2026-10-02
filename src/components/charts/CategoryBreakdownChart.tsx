import type { JSX } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryTotal } from "../../types/index.ts";
import { formatCurrency } from "../../utils/format.ts";

interface CategoryBreakdownChartProps {
  data: CategoryTotal[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps): JSX.Element {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  if (data.length === 0 || total === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Nenhum gasto registrado neste mês ainda.
      </p>
    );
  }

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="var(--chart-surface, #fcfcfb)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(11,11,11,0.1)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {data
          .toSorted((a, b) => b.total - a.total)
          .map((item) => (
            <li key={item.categoryId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="tabular-nums text-slate-500 dark:text-slate-400">
                {formatCurrency(item.total)} · {((item.total / total) * 100).toFixed(0)}%
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
