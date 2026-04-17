# Source Access Notes

## What Is Readable From Here

- `https://ui.shadcn.com/examples/dashboard`
  - Public and readable.
- `https://tablecrm-mobile-order.vercel.app`
  - Public and readable.
- `https://app.tablecrm.com/docs_sales?token=...`
  - Readable and inspectable with Playwright.
- `https://app.tablecrm.com/api/v1/docs`
  - Readable and inspectable with Playwright.
  - The underlying OpenAPI schema is available at `/api/v1/openapi.json`.

## What Should Be Provided By The User If Precision Matters

- Screenshots or copied markup/text of the sale-creation modal if pixel-level parity is required.
- Example API responses for the key dictionaries if strict typing must match production precisely.
- Business rules that are not visible in the schema, such as the exact semantics of "create and conduct".

## Safe Working Assumption

The linked references are now enough to inspect the real UI structure and API schema. The remaining uncertainty is business semantics that are not obvious from the UI or OpenAPI alone.
