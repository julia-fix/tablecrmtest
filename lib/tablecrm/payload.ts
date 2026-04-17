import type { OrderSubmission } from "@/lib/tablecrm/schema";

function round(value: number) {
  return Number(value.toFixed(2));
}

export function getLineItemTotal(item: OrderSubmission["items"][number]) {
  const subtotal = item.price * item.quantity;
  return round(Math.max(0, subtotal - item.discount));
}

export function getOrderTotal(items: OrderSubmission["items"]) {
  return round(items.reduce((sum, item) => sum + getLineItemTotal(item), 0));
}

export function buildOrderPayload(input: OrderSubmission) {
  return [
    {
      priority: input.priority,
      dated: Math.floor(Date.now() / 1000),
      operation: "Заказ",
      tax_included: true,
      tax_active: true,
      goods: input.items.map((item) => ({
        price: round(item.price),
        quantity: round(item.quantity),
        unit: item.unitId,
        discount: round(item.discount),
        sum_discounted: round(item.discount),
        nomenclature: item.productId,
        price_type: input.priceType,
        unit_name: item.unitName,
        nomenclature_name: item.productName
      })),
      settings: {},
      warehouse: input.warehouse,
      contragent: input.contragent,
      paybox: input.paybox,
      organization: input.organization,
      loyality_card_id: input.loyalityCardId,
      status: input.mode === "conduct",
      paid_rubles: round(input.paidRubles),
      paid_lt: round(input.paidLt),
      comment: input.comment?.trim() || undefined
    }
  ];
}
