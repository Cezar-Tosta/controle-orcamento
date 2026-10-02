import { format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function monthLabel(year: number, month: number): string {
  const label = format(new Date(year, month - 1, 1), "MMMM 'de' yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shortDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return format(new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1), "dd/MM");
}

export function daysInMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1));
}

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: format(new Date(2000, index, 1), "MMMM", { locale: ptBR }),
}));
