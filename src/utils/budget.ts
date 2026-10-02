import { differenceInCalendarDays, getDaysInMonth, parseISO } from "date-fns";
import type { Goal } from "../db/db.ts";

export interface BudgetStatusInput {
  year: number;
  /** 1-12 */
  month: number;
  totalAmount: number;
  /** ISO date (yyyy-MM-dd) the budget amount was registered. */
  registeredOn: string;
  /** Amounts (in currency units) of every expense dated between registeredOn and today, inclusive. */
  expenseAmounts: readonly number[];
  /** Defaults to now; injectable for tests. */
  today?: Date;
}

export interface BudgetStatus {
  /** How much can be spent per day, from the registration day to the end of the month. */
  dailyAverage: number;
  /** Days between the registration day and the end of the month, inclusive. */
  totalDaysInPeriod: number;
  elapsedDays: number;
  remainingDays: number;
  /** How much was "allowed" to be spent so far (dailyAverage * elapsedDays). */
  allowedCumulative: number;
  /** How much was actually spent so far. */
  spentCumulative: number;
  /** allowedCumulative - spentCumulative. Positive = under budget (surplus), negative = overspent. */
  balance: number;
  /** totalAmount - spentCumulative. */
  remainingBudget: number;
}

export function calculateDailyAverage(
  totalAmount: number,
  year: number,
  month: number,
  registeredOn: string,
): number {
  const totalDaysInMonth = getDaysInMonth(new Date(year, month - 1));
  const registeredDay = parseISO(registeredOn).getDate();
  const daysInWindow = totalDaysInMonth - registeredDay + 1;
  if (daysInWindow <= 0) return 0;
  return totalAmount / daysInWindow;
}

export function calculateBudgetStatus(input: BudgetStatusInput): BudgetStatus {
  const { year, month, totalAmount, registeredOn, expenseAmounts } = input;
  const today = input.today ?? new Date();

  const totalDaysInMonth = getDaysInMonth(new Date(year, month - 1));
  const registeredDate = parseISO(registeredOn);
  const registeredDay = registeredDate.getDate();
  const totalDaysInPeriod = Math.max(totalDaysInMonth - registeredDay + 1, 0);
  const dailyAverage = totalDaysInPeriod > 0 ? totalAmount / totalDaysInPeriod : 0;

  const lastDayOfMonth = new Date(year, month, 0);
  const cappedToday = today > lastDayOfMonth ? lastDayOfMonth : today;
  const elapsedDaysRaw = differenceInCalendarDays(cappedToday, registeredDate) + 1;
  const elapsedDays = Math.min(Math.max(elapsedDaysRaw, 0), totalDaysInPeriod);
  const remainingDays = Math.max(totalDaysInPeriod - elapsedDays, 0);

  const allowedCumulative = dailyAverage * elapsedDays;
  const spentCumulative = expenseAmounts.reduce((sum, amount) => sum + amount, 0);
  const balance = allowedCumulative - spentCumulative;
  const remainingBudget = totalAmount - spentCumulative;

  return {
    dailyAverage,
    totalDaysInPeriod,
    elapsedDays,
    remainingDays,
    allowedCumulative,
    spentCumulative,
    balance,
    remainingBudget,
  };
}

/**
 * Among incomplete goals, finds the highest-priority one whose remaining
 * amount fits within the current surplus — i.e. what the user could fund
 * right now without breaking their daily average.
 */
export function findAffordableGoal(
  goals: readonly Goal[],
  availableBalance: number,
): Goal | undefined {
  if (availableBalance <= 0) return undefined;

  return goals
    .filter((goal) => !goal.completedAt && goal.targetAmount - goal.savedAmount > 0)
    .toSorted((a, b) => a.priority - b.priority)
    .find((goal) => goal.targetAmount - goal.savedAmount <= availableBalance);
}

export function goalRemainingAmount(goal: Goal): number {
  return Math.max(goal.targetAmount - goal.savedAmount, 0);
}
