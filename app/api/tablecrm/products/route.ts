import { NextResponse } from "next/server";
import { productSchema } from "@/lib/tablecrm/schema";
import { extractList, requireToken, tableCrmFetch, TableCrmError } from "@/lib/tablecrm/http";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const token = requireToken(searchParams);
    const q = searchParams.get("q")?.trim() ?? "";
    const query = new URLSearchParams({
      token,
      with_prices: "true",
      with_balance: "true",
      limit: "20"
    });

    if (q) {
      query.set("name", q);
    }

    const payload = await tableCrmFetch<unknown>("/nomenclature/", undefined, query);
    const products = extractList(payload, (item) => productSchema.parse(item));

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof TableCrmError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
