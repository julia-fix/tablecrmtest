import { NextResponse } from "next/server";
import { customerSchema } from "@/lib/tablecrm/schema";
import { extractList, requireToken, tableCrmFetch, TableCrmError } from "@/lib/tablecrm/http";
import { normalizePhone } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const token = requireToken(searchParams);
    const phone = normalizePhone(searchParams.get("phone") ?? "");

    if (!phone) {
      return NextResponse.json({ customers: [] });
    }

    const query = new URLSearchParams({
      token,
      phone,
      limit: "20"
    });

    const payload = await tableCrmFetch<unknown>("/contragents/", undefined, query);
    const customers = extractList(payload, (item) => customerSchema.parse(item));

    return NextResponse.json({ customers });
  } catch (error) {
    if (error instanceof TableCrmError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to load customers" }, { status: 500 });
  }
}
