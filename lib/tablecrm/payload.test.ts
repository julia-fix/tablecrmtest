import { buildOrderPayload, getLineItemTotal, getOrderTotal } from "@/lib/tablecrm/payload";

describe("payload helpers", () => {
  it("calculates line totals with discount", () => {
    expect(
      getLineItemTotal({
        productId: 1,
        productName: "Товар",
        quantity: 2,
        price: 150,
        unitId: 116,
        unitName: "шт",
        discount: 25
      })
    ).toBe(275);
  });

  it("builds a docs_sales payload array", () => {
    const payload = buildOrderPayload({
      token: "secret",
      mode: "conduct",
      contragent: 10,
      organization: 20,
      paybox: 30,
      warehouse: 40,
      priceType: 50,
      loyalityCardId: 70,
      paidRubles: 180,
      paidLt: 40,
      priority: 4,
      comment: "Тестовый заказ",
      items: [
        {
          productId: 100,
          productName: "Кофе",
          quantity: 2,
          price: 120,
          unitId: 116,
          unitName: "шт",
          discount: 20
        }
      ]
    });

    expect(payload).toHaveLength(1);
    expect(payload[0]).toMatchObject({
      priority: 4,
      operation: "Заказ",
      organization: 20,
      paybox: 30,
      warehouse: 40,
      contragent: 10,
      loyality_card_id: 70,
      status: true,
      paid_rubles: 180,
      paid_lt: 40,
      goods: [
        {
          nomenclature: 100,
          price: 120,
          quantity: 2,
          unit: 116,
          discount: 20,
          sum_discounted: 20,
          price_type: 50
        }
      ]
    });
  });

  it("aggregates totals across items", () => {
    expect(
      getOrderTotal([
        {
          productId: 1,
          productName: "A",
          quantity: 1,
          price: 100,
          unitId: 116,
          unitName: "шт",
          discount: 10
        },
        {
          productId: 2,
          productName: "B",
          quantity: 3,
          price: 50,
          unitId: 116,
          unitName: "шт",
          discount: 0
        }
      ])
    ).toBe(240);
  });
});
