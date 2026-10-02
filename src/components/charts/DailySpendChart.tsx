import type { JSX } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatCurrency } from "../../utils/format.ts";

export interface DailySpendPoint {
  day: number;
  amount: number;
}

interface DailySpendChartProps {
  data: DailySpendPoint[];
  dailyAverage: number;
}

const GOOD = "#0ca30c";
const CRITICAL = "#d03b3b";

export function DailySpendChart({ data, dailyAverage }: DailySpendChartProps): JSX.Element {
  if (data.every((point) => point.amount === 0)) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">Nenhum gasto registrado ainda.</p>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" strokeDasharray="2 4" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: "#c3c2b7" }}
            tick={{ fontSize: 10, fill: "#898781" }}
            interval={Math.ceil(data.length / 10)}
          />
          <ReferenceLine
            y={dailyAverage}
            stroke="#898781"
            strokeDasharray="4 4"
            label={{
              value: `média ${formatCurrency(dailyAverage)}`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "#898781",
            }}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Gasto"]}
            labelFormatter={(day) => `Dia ${String(day)}`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(11,11,11,0.1)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={18}>
            {data.map((point) => (
              <Cell key={point.day} fill={point.amount > dailyAverage ? CRITICAL : GOOD} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
