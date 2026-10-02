import Dexie, { type EntityTable } from "dexie";

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Expense {
  id?: number;
  categoryId: number;
  description: string;
  amount: number;
  /** ISO date (yyyy-MM-dd), the day the expense happened. */
  date: string;
  createdAt: string;
}

export interface Goal {
  id?: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
  /** Lower number = higher priority. Unique ordering among active goals. */
  priority: number;
  createdAt: string;
  completedAt?: string;
}

export interface BudgetPeriod {
  id?: number;
  year: number;
  /** 1-12 */
  month: number;
  totalAmount: number;
  /** ISO date the budget amount was registered/entered. */
  registeredOn: string;
  createdAt: string;
}

export interface BudgetInjection {
  id?: number;
  year: number;
  /** 1-12 */
  month: number;
  amount: number;
  /** ISO date (yyyy-MM-dd) the user received/added this extra amount. */
  date: string;
  createdAt: string;
}

class BudgetDatabase extends Dexie {
  categories!: EntityTable<Category, "id">;
  expenses!: EntityTable<Expense, "id">;
  goals!: EntityTable<Goal, "id">;
  budgetPeriods!: EntityTable<BudgetPeriod, "id">;
  budgetInjections!: EntityTable<BudgetInjection, "id">;

  constructor() {
    super("controle-orcamento");
    this.version(1).stores({
      categories: "++id, name",
      expenses: "++id, categoryId, date",
      goals: "++id, priority",
      budgetPeriods: "++id, &[year+month]",
    });
    this.version(2).stores({
      categories: "++id, name",
      expenses: "++id, categoryId, date",
      goals: "++id, priority",
      budgetPeriods: "++id, &[year+month]",
      budgetInjections: "++id, [year+month]",
    });
  }
}

export const db = new BudgetDatabase();

// If another open tab/instance (e.g. a regular Chrome tab left open besides
// the installed PWA) is holding an older-schema connection, it blocks this
// one from finishing its version upgrade — it just hangs with no feedback.
// These two handlers make that recoverable instead of silently stuck:
// the old connection closes itself and reloads, and if it can't (listener
// didn't attach in time), this connection tells the user what to do.
db.on("versionchange", () => {
  db.close();
  window.location.reload();
});

db.on("blocked", () => {
  window.alert("Feche outras abas ou janelas deste app abertas no celular e tente de novo.");
});

// Colors follow a validated categorical order (see scripts/validate_palette.js
// in the dataviz skill): fixed hue slots, never reassigned by rank, so the
// dashboard's category chart stays colorblind-safe without per-user tuning.
const DEFAULT_CATEGORIES: ReadonlyArray<Omit<Category, "id" | "createdAt">> = [
  { name: "Alimentação", color: "#2a78d6", icon: "tag" }, // slot 1 blue
  { name: "Transporte", color: "#eb6834", icon: "tag" }, // slot 2 orange
  { name: "Moradia", color: "#1baf7a", icon: "tag" }, // slot 3 aqua
  { name: "Lazer", color: "#eda100", icon: "tag" }, // slot 4 yellow
  { name: "Saúde", color: "#e87ba4", icon: "tag" }, // slot 5 magenta
  { name: "Outros", color: "#64748b", icon: "tag" }, // neutral "other" bucket
];

export async function seedDefaultCategories(): Promise<void> {
  // Wrapped in a single rw transaction so two concurrent callers (e.g. React
  // StrictMode's double-invoked mount effect) can't both pass the count
  // check before either has written, which would seed duplicates.
  await db.transaction("rw", db.categories, async () => {
    const count = await db.categories.count();
    if (count > 0) return;
    const now = new Date().toISOString();
    await db.categories.bulkAdd(
      DEFAULT_CATEGORIES.map((category) => ({ ...category, createdAt: now })),
    );
  });
}

export const COFRINHO_CATEGORY_NAME = "Cofrinho";

/**
 * Money moved into a savings goal is recorded as a regular expense under this
 * category, so it reduces the available budget the same way any other
 * spending would — otherwise the same balance could be "spent" on a goal and
 * still show up as available to spend elsewhere.
 */
export async function getOrCreateCofrinhoCategoryId(): Promise<number> {
  return db.transaction("rw", db.categories, async () => {
    const existing = await db.categories.where("name").equals(COFRINHO_CATEGORY_NAME).first();
    if (existing) return existing.id!;
    const newId = await db.categories.add({
      name: COFRINHO_CATEGORY_NAME,
      color: "#4a3aa7", // violet — distinct from the spending category palette
      icon: "piggyBank",
      createdAt: new Date().toISOString(),
    });
    return newId!;
  });
}
