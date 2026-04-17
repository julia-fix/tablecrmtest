---
name: tablecrm-mobile-order
description: Use when implementing the TableCRM mobile order test app from task.txt. Covers the required mobile flow, TableCRM entities, source-material caveats, and the recommended Next.js plus shadcn/ui delivery workflow.
---

# TableCRM Mobile Order

Use this skill when working on the TableCRM mobile order test app in this repository.

## Read First

- Read `references/task-brief.md` for the normalized task requirements.
- Read `references/live-inspection.md` for the production UI and API findings captured from the linked pages.
- Read `references/source-access.md` before relying on linked external materials.
- Follow root-level repo rules in `AGENTS.md`.

## Delivery Defaults

- Build the app with `Next.js`, TypeScript, and `shadcn/ui`.
- Treat the task's `next/ssr/vite/shadcn` line as an imprecise stack note. Default to Next.js and do not combine it with Vite unless the user requests that explicitly.
- Keep the app mobile-first and task-focused. The shadcn dashboard example is a component/style reference, not a layout to copy.
- Mirror the production sale modal fields and submit actions where practical, while adapting the interaction model for a mobile form.

## Required User Flow

1. Enter cashier token.
2. Load dictionaries required to create a sale.
3. Search customer by phone and select the match.
4. Select organization, paybox, warehouse, and price type.
5. Search products and add them to the cart.
6. Edit quantity and price as needed.
7. Submit either:
   - create sale
   - create and conduct

## Implementation Guidance

- Create a dedicated API client layer for TableCRM.
- Parse external responses through runtime validation before use.
- Keep cart math and payload construction in pure utility functions.
- Prefer route handlers or server utilities as the integration boundary if direct browser calls are brittle.
- Build the narrow-screen experience first, then confirm it still behaves cleanly on larger screens.
- The create-sale endpoint is `POST /docs_sales/?token=...` and expects an array body.
- For customer search, use `GET /contragents/?token=...&phone=...`.
- For product search, prefer `GET /nomenclature/?token=...&name=...&with_prices=true`.
- Treat advanced parameters as optional until the core mobile flow works.

## When More Context Is Needed

- For exact business requirements, entity list, and action list, read `references/task-brief.md`.
- For inspected field labels, API schema details, and modal parity notes, read `references/live-inspection.md`.
- For availability of linked sources and remaining source caveats, read `references/source-access.md`.
