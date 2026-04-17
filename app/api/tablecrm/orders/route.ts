import { NextResponse } from "next/server";
import { buildOrderPayload } from "@/lib/tablecrm/payload";
import { orderSubmissionSchema } from "@/lib/tablecrm/schema";
import { tableCrmFetch, TableCrmError } from "@/lib/tablecrm/http";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const submission = orderSubmissionSchema.parse(json);
    const query = new URLSearchParams({
      token: submission.token,
      generate_out: "true"
    });

    const payload = buildOrderPayload(submission);
    const result = await tableCrmFetch<unknown>(
      "/docs_sales/",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      query
    );

    return NextResponse.json({ ok: true, result, payload });
  } catch (error) {
    if (error instanceof TableCrmError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
