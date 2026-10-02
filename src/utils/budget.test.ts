import { describe, expect, it } from "vitest";
import {
  calculateBudgetStatus,
  calculateDailyAverage,
  findAffordableGoal,
  goalRemainingAmount,
} from "./budget.ts";
import type { Goal } from "../db/db.ts";

describe("calculateDailyAverage", () => {
  it("splits the total across the days remaining in the month from the registration day", () => {
    // January has 31 days; registering on the 1st means 31 days in the window.
    expect(calculateDailyAverage(3100, 2026, 1, "2026-01-01")).toBeCloseTo(100);
  });

  it("shrinks the window when registered mid-month", () => {
    // Registering on the 21st of a 30-day month leaves 10 days (21..30).
    expect(calculateDailyAverage(1000, 2026, 4, "2026-04-21")).toBeCloseTo(100);
  });

  it("returns 0 when the registration day falls outside the target month's days", () => {
    // Only the day-of-month is read; day 31 has no match in a 28-day February.
    expect(calculateDailyAverage(1000, 2026, 2, "2026-01-31")).toBe(0);
  });
});

describe("calculateBudgetStatus", () => {
  it("reports a positive balance when spending is under the allowed average", () => {
    const status = calculateBudgetStatus({
      year: 2026,
      month: 1,
      totalAmount: 3100,
      registeredOn: "2026-01-01",
      expenseAmounts: [50, 30],
      today: new Date(2026, 0, 3),
    });

    // dailyAverage = 100, elapsedDays = 3 (1st, 2nd, 3rd) -> allowed = 300
    expect(status.dailyAverage).toBeCloseTo(100);
    expect(status.elapsedDays).toBe(3);
    expect(status.allowedCumulative).toBeCloseTo(300);
    expect(status.spentCumulative).toBe(80);
    expect(status.balance).toBeCloseTo(220);
    expect(status.remainingBudget).toBeCloseTo(3020);
  });

  it("reports a negative balance when overspending", () => {
    const status = calculateBudgetStatus({
      year: 2026,
      month: 1,
      totalAmount: 3100,
      registeredOn: "2026-01-01",
      expenseAmounts: [500],
      today: new Date(2026, 0, 2),
    });

    // dailyAverage = 100, elapsedDays = 2 -> allowed = 200, spent = 500
    expect(status.balance).toBeCloseTo(-300);
  });

  it("caps elapsed days at the end of the budget window", () => {
    const status = calculateBudgetStatus({
      year: 2026,
      month: 2, // 28 days, not a leap year
      totalAmount: 2800,
      registeredOn: "2026-02-01",
      expenseAmounts: [],
      today: new Date(2026, 2, 15), // well past February
    });

    expect(status.totalDaysInPeriod).toBe(28);
    expect(status.elapsedDays).toBe(28);
    expect(status.remainingDays).toBe(0);
    expect(status.allowedCumulative).toBeCloseTo(2800);
  });
});

function makeGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 1,
    name: "Goal",
    targetAmount: 100,
    savedAmount: 0,
    priority: 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("findAffordableGoal", () => {
  it("returns undefined when there is no surplus", () => {
    const goals = [makeGoal({ targetAmount: 50 })];
    expect(findAffordableGoal(goals, 0)).toBeUndefined();
    expect(findAffordableGoal(goals, -10)).toBeUndefined();
  });

  it("picks the highest-priority goal that fits the available balance", () => {
    const goals = [
      makeGoal({ id: 1, name: "Expensive", priority: 1, targetAmount: 500 }),
      makeGoal({ id: 2, name: "Cheap", priority: 2, targetAmount: 100 }),
    ];

    expect(findAffordableGoal(goals, 150)?.name).toBe("Cheap");
  });

  it("prefers the top-priority goal when it also fits", () => {
    const goals = [
      makeGoal({ id: 1, name: "Top priority", priority: 1, targetAmount: 100 }),
      makeGoal({ id: 2, name: "Lower priority", priority: 2, targetAmount: 50 }),
    ];

    expect(findAffordableGoal(goals, 150)?.name).toBe("Top priority");
  });

  it("ignores completed goals", () => {
    const goals = [
      makeGoal({
        id: 1,
        name: "Done",
        priority: 1,
        targetAmount: 50,
        savedAmount: 50,
        completedAt: new Date().toISOString(),
      }),
    ];

    expect(findAffordableGoal(goals, 1000)).toBeUndefined();
  });

  it("accounts for amounts already saved towards a goal", () => {
    const goals = [makeGoal({ targetAmount: 200, savedAmount: 150 })];
    expect(findAffordableGoal(goals, 40)).toBeUndefined();
    expect(findAffordableGoal(goals, 50)?.id).toBe(1);
  });
});

describe("goalRemainingAmount", () => {
  it("never returns a negative number", () => {
    expect(goalRemainingAmount(makeGoal({ targetAmount: 100, savedAmount: 150 }))).toBe(0);
  });

  it("returns the difference otherwise", () => {
    expect(goalRemainingAmount(makeGoal({ targetAmount: 100, savedAmount: 30 }))).toBe(70);
  });
});
