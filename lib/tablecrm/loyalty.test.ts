import { clampLoyaltyPayment, getLoyaltyBalance, getMaxLoyaltyPayment } from "@/lib/tablecrm/loyalty";

describe("loyalty helpers", () => {
  const loyaltyCard = {
    id: 1,
    card_number: "12345",
    phone_number: "+79990000000",
    contragent_id: 10,
    contragent_name: "Иван",
    organization_id: 20,
    cashback_percent: 5,
    max_withdraw_percentage: 30,
    status_card: true,
    data: {
      balance: "175.5"
    }
  };

  it("extracts balance from card data", () => {
    expect(getLoyaltyBalance(loyaltyCard)).toBe(175.5);
  });

  it("respects percentage and order-total limits", () => {
    expect(getMaxLoyaltyPayment(loyaltyCard, 400)).toBe(120);
  });

  it("clamps requested loyalty payment", () => {
    expect(clampLoyaltyPayment(999, loyaltyCard, 400)).toBe(120);
    expect(clampLoyaltyPayment(80, loyaltyCard, 400)).toBe(80);
  });
});
