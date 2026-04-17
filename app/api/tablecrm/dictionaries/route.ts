import { NextResponse } from "next/server";
import {
  organizationSchema,
  payboxSchema,
  priceTypeSchema,
  unitSchema,
  warehouseSchema
} from "@/lib/tablecrm/schema";
import { extractList, requireToken, tableCrmFetch, TableCrmError } from "@/lib/tablecrm/http";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const token = requireToken(searchParams);
    const tokenQuery = new URLSearchParams({ token });

    const [organizations, payboxes, warehouses, priceTypes, units] = await Promise.all([
      tableCrmFetch<unknown>("/organizations/", undefined, tokenQuery),
      tableCrmFetch<unknown>("/payboxes/", undefined, tokenQuery),
      tableCrmFetch<unknown>("/warehouses/", undefined, tokenQuery),
      tableCrmFetch<unknown>("/price_types/", undefined, tokenQuery),
      tableCrmFetch<unknown>("/units/")
    ]);

    return NextResponse.json({
      organizations: extractList(organizations, (item) => organizationSchema.parse(item)),
      payboxes: extractList(payboxes, (item) => payboxSchema.parse(item)),
      warehouses: extractList(warehouses, (item) => warehouseSchema.parse(item)),
      priceTypes: extractList(priceTypes, (item) => priceTypeSchema.parse(item)),
      units: extractList(units, (item) => unitSchema.parse(item))
    });
  } catch (error) {
    if (error instanceof TableCrmError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to load dictionaries" }, { status: 500 });
  }
}
