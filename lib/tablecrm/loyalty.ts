import type { LoyaltyCard } from "@/lib/tablecrm/schema";

const BALANCE_KEYS = [
  "balance",
  "bonus_balance",
  "bonuses",
  "bonus",
  "loyalty_balance",
  "lt",
  "points",
  "available_bonus",
  "available_bonuses",
  "available_points"
];

function round(value: number) {
  return Number(value.toFixed(2));
}

function toNumeric(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function findBalanceValue(value: unknown): number | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  for (const key of BALANCE_KEYS) {
    if (key in value) {
      const directValue = toNumeric((value as Record<string, unknown>)[key]);
      if (directValue !== null) {
        return directValue;
      }
    }
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    const resolved = findBalanceValue(nestedValue);
    if (resolved !== null) {
      return resolved;
    }
  }

  return null;
}

export function getLoyaltyBalance(card: LoyaltyCard | null) {
  if (!card) {
    return 0;
  }

  const directBalance = typeof card.balance === "number" ? card.balance : null;
  return Math.max(0, round(directBalance ?? findBalanceValue(card.data) ?? 0));
}

export function getMaxLoyaltyPayment(card: LoyaltyCard | null, orderTotal: number) {
  if (!card || orderTotal <= 0) {
    return 0;
  }

  const balance = getLoyaltyBalance(card);
  const percentageLimit =
    typeof card.max_withdraw_percentage === "number" && card.max_withdraw_percentage > 0
      ? orderTotal * (card.max_withdraw_percentage / 100)
      : orderTotal;

  return round(Math.max(0, Math.min(balance, percentageLimit, orderTotal)));
}

export function clampLoyaltyPayment(requestedAmount: number, card: LoyaltyCard | null, orderTotal: number) {
  const maxAllowed = getMaxLoyaltyPayment(card, orderTotal);
  return round(Math.min(Math.max(0, requestedAmount), maxAllowed));
}
