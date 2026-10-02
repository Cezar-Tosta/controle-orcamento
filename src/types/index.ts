export type TabKey = "dashboard" | "expenses" | "goals" | "categories" | "settings";

export interface CategoryTotal {
  categoryId: number;
  name: string;
  color: string;
  total: number;
}
