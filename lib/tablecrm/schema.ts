import { z } from "zod";

const numericLike = z.union([z.number(), z.string()]).transform((value) => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
});

export const customerSchema = z.object({
  id: z.number(),
  name: z.string().catch("Без имени"),
  phone: z.string().nullish().transform((value) => value ?? "")
});

export const loyaltyCardSchema = z.object({
  id: z.number(),
  card_number: z
    .union([z.string(), z.number()])
    .nullish()
    .transform((value) => (value === null || value === undefined ? "" : String(value))),
  phone_number: z.string().nullish().transform((value) => value ?? ""),
  contragent_id: z.number().nullish(),
  contragent_name: z
    .union([z.string(), z.null(), z.undefined()])
    .optional(),
  contragent: z
    .union([z.string(), z.null(), z.undefined()])
    .optional(),
  organization_id: z.number().nullish(),
  balance: numericLike.nullish(),
  cashback_percent: z.number().nullish(),
  max_withdraw_percentage: z.number().nullish(),
  status_card: z.boolean().nullish().transform((value) => value ?? true),
  data: z.record(z.string(), z.unknown()).nullish()
})
  .transform((value) => ({
    ...value,
    contragent_name: value.contragent_name ?? value.contragent ?? "",
    data: value.data ?? {}
  }));

export const organizationSchema = z.object({
  id: z.number(),
  short_name: z.string(),
  full_name: z.string().nullish().transform((value) => value ?? "")
});

export const warehouseSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullish().transform((value) => value ?? "")
});

export const payboxSchema = z.object({
  id: z.number(),
  name: z.string(),
  organization_id: z.number().nullish()
});

export const priceTypeSchema = z.object({
  id: z.number(),
  name: z.string()
});

export const unitSchema = z.object({
  id: z.number(),
  name: z.string(),
  symbol_national_view: z.string()
});

export const productPriceSchema = z
  .object({
    price: numericLike,
    price_type: z.union([z.number(), z.string()]).optional(),
    price_type_id: z.number().optional()
  })
  .passthrough();

export const productBalanceSchema = z
  .object({
    warehouse: z.number().optional(),
    warehouse_id: z.number().optional(),
    warehouse_name: z.string().optional(),
    quantity: numericLike.optional(),
    current_amount: numericLike.optional()
  })
  .passthrough()
  .transform((value) => ({
    ...value,
    quantity: value.quantity ?? value.current_amount
  }));

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  unit: z.number().nullish(),
  unit_name: z.string().nullish().transform((value) => value ?? ""),
  prices: z.array(productPriceSchema).nullish().transform((value) => value ?? []),
  balances: z.array(productBalanceSchema).nullish().transform((value) => value ?? [])
});

export const lineItemFormSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  quantity: z.number().positive(),
  price: z.number().min(0),
  unitId: z.number().optional(),
  unitName: z.string().optional(),
  discount: z.number().min(0).default(0)
});

export const orderSubmissionSchema = z.object({
  token: z.string().min(1),
  mode: z.enum(["create", "conduct"]),
  contragent: z.number(),
  organization: z.number(),
  paybox: z.number(),
  warehouse: z.number(),
  priceType: z.number(),
  loyalityCardId: z.number().optional(),
  paidRubles: z.number().min(0),
  paidLt: z.number().min(0).default(0),
  comment: z.string().max(500).optional(),
  priority: z.number().min(0).max(10).default(0),
  items: z.array(lineItemFormSchema).min(1)
});

export type Customer = z.infer<typeof customerSchema>;
export type LoyaltyCard = z.infer<typeof loyaltyCardSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Warehouse = z.infer<typeof warehouseSchema>;
export type Paybox = z.infer<typeof payboxSchema>;
export type PriceType = z.infer<typeof priceTypeSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductPrice = z.infer<typeof productPriceSchema>;
export type LineItemForm = z.infer<typeof lineItemFormSchema>;
export type OrderSubmission = z.infer<typeof orderSubmissionSchema>;
