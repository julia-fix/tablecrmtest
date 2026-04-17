import { loyaltyCardSchema, productSchema } from "@/lib/tablecrm/schema";

describe("tablecrm schemas", () => {
  it("parses loyalty cards returned by the live API", () => {
    const parsed = loyaltyCardSchema.parse({
      id: 106110,
      card_number: 4088758907984613,
      tags: null,
      balance: 0,
      income: null,
      outcome: null,
      contragent_id: 850047,
      organization_id: null,
      contragent: "Семен",
      organization: "",
      cashback_percent: null,
      minimal_checque_amount: null,
      max_withdraw_percentage: null,
      start_period: null,
      end_period: null,
      max_percentage: null,
      lifetime: null,
      apple_wallet_advertisement: "",
      status_card: null,
      is_deleted: false,
      created_at: 1776275649,
      updated_at: 1776275649
    });

    expect(parsed.card_number).toBe("4088758907984613");
    expect(parsed.balance).toBe(0);
    expect(parsed.contragent_name).toBe("Семен");
    expect(parsed.data).toEqual({});
    expect(parsed.status_card).toBe(true);
  });

  it("parses products returned by the live API", () => {
    const parsed = productSchema.parse({
      name: "Очпочмак",
      id: 126202,
      unit: 116,
      unit_name: "шт",
      prices: [
        {
          price: 5000,
          price_type: "Тестовый вид цены"
        }
      ],
      balances: [
        {
          warehouse_name: "Москва",
          current_amount: -2
        }
      ]
    });

    expect(parsed.prices[0]?.price_type).toBe("Тестовый вид цены");
    expect(parsed.balances[0]?.warehouse_name).toBe("Москва");
    expect(parsed.balances[0]?.quantity).toBe(-2);
  });
});
