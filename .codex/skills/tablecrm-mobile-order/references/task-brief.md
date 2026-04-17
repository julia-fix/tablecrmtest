# Task Brief

## Product Goal

Create a mobile web app for making a sale order for `tablecrm.com`.

## Primary Source

The source brief comes from `task.txt`.

## Referenced Product Areas

- TableCRM sale creation modal:
  - `https://app.tablecrm.com/docs_sales?token=...`
- TableCRM API docs:
  - `https://app.tablecrm.com/api/v1/docs`
- shadcn reference:
  - `https://ui.shadcn.com/examples/dashboard`
- Example implementation:
  - `https://tablecrm-mobile-order.vercel.app`

## Required Inputs and Selections

- Cash register token for authorization against a specific cashier.
- Customer phone input with lookup by phone.
- Display and selection of:
  - payboxes
  - organizations
  - warehouses
  - price types
- Product selection matching the sale-creation modal behavior.

## Required Actions

- Create sale.
- Create and conduct.

Observed production labels:

- `Только создать`
- `Создать и провести`

## Key API Entity Groups Mentioned

- Customers: `contragents`
- Warehouses
- Payboxes
- Organizations
- Price types
- Nomenclature / products

## Payload Notes

- A Google Doc is referenced as an example payload.
- Treat it as supplementary, not canonical.
- Exact request modeling should be confirmed from API docs, observed requests, or user-provided payload samples.
- The OpenAPI schema confirms that `POST /docs_sales/` expects an array body.

## Delivery Expectations

- The app should be well-structured and production-like, not a one-file demo.
- The UI should use `shadcn/ui`.
- The app should prioritize mobile UX.
- The app should reflect the production sale modal field set, but in a mobile-first flow rather than a desktop modal clone.
