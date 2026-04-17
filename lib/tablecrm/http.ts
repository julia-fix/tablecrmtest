const BASE_URL = "https://app.tablecrm.com/api/v1";

function extractErrorMessage(payload: unknown) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("detail" in payload && typeof payload.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  if ("message" in payload && typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return null;
}

export class TableCrmError extends Error {
  constructor(message: string, public status = 500, public details?: unknown) {
    super(message);
    this.name = "TableCrmError";
  }
}

export async function tableCrmFetch<T>(
  path: string,
  init?: RequestInit,
  query?: URLSearchParams
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    url.search = query.toString();
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new TableCrmError(extractErrorMessage(payload) ?? "TableCRM request failed", response.status, payload);
  }

  return payload as T;
}

export function extractList<T>(payload: unknown, parser: (item: unknown) => T): T[] {
  const items = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "result" in payload && Array.isArray(payload.result)
      ? payload.result
      : [];

  return items.map(parser);
}

export function requireToken(searchParams: URLSearchParams) {
  const token = searchParams.get("token")?.trim();
  if (!token) {
    throw new TableCrmError("Token is required", 400);
  }
  return token;
}
