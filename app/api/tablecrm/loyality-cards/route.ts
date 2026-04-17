import { NextResponse } from "next/server";
import { loyaltyCardSchema } from "@/lib/tablecrm/schema";
import { extractList, requireToken, tableCrmFetch, TableCrmError } from "@/lib/tablecrm/http";
import { normalizePhone } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const token = requireToken(searchParams);
    const phone = normalizePhone(searchParams.get("phone") ?? "");

    if (!phone) {
      return NextResponse.json({ loyaltyCards: [] });
    }

    const query = new URLSearchParams({
      token,
      phone_number: phone,
      limit: "50"
    });

    const payload = await tableCrmFetch<unknown>("/loyality_cards/", undefined, query);
    const loyaltyCards = extractList(payload, (item) => loyaltyCardSchema.parse(item)).filter(
      (card) => card.status_card
    );

    return NextResponse.json({ loyaltyCards });
  } catch (error) {
    if (error instanceof TableCrmError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to load loyalty cards" }, { status: 500 });
  }
}
