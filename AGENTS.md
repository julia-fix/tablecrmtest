# TableCRM Test App

## Goal

Build a production-quality mobile web app for creating a TableCRM sale order from a cashier token, matching the task brief in `task.txt`.

## Stack Decision

- Use `Next.js` with TypeScript and App Router.
- Use `shadcn/ui` for primitives and styling.
- Treat `SSR` as a requirement fulfilled by Next.js route handlers and server rendering where it helps.
- Do not introduce `Vite` alongside Next.js unless the user explicitly asks for that split.

## Architecture Rules

- Keep domain logic out of React components.
- Put TableCRM HTTP calls behind a thin app-layer API boundary such as `app/api/*` route handlers or dedicated server utilities.
- Validate all external responses and outgoing payloads with runtime schemas.
- Keep payload-building logic in pure functions that are easy to test.
- Separate these concerns:
  - UI components
  - form state and validation
  - remote API access
  - payload assembly
  - display formatting

## Mobile UX Rules

- Design mobile-first for widths from `360px`.
- Avoid dense desktop dashboard patterns that collapse poorly on phones.
- Use `shadcn/ui` components and styling patterns, but do not copy the desktop-heavy dashboard layout from the shadcn example.
- Respect touch target size, numeric keyboard input for phone and quantity fields, and safe spacing around the mobile keyboard.
- Show loading, empty, and error states for every remote dataset.

## Modal Parity

- The TableCRM sale modal labels observed in production are:
  - `Контрагент`
  - `Счет поступления`
  - `Склад отгрузки`
  - `Организация`
  - `Приоритет`
  - `Тип цены`
- The item table columns are:
  - `Название товара`
  - `Сумма`
  - `Скидка`
  - `Количество`
  - `Вес (г)`
  - `Единица`
  - `Итого`
- The totals block includes:
  - `Без скидки`
  - `Скидка`
  - `Остаток лояльности`
  - `Итого`
  - `Баллами`
  - `Рублями`
- The production modal actions are:
  - `Создать и провести`
  - `Только создать`
- Optional advanced parameters exist in production, but they are secondary for the mobile test app:
  - `Номер`
  - `Комментарий`
  - `Договор`
  - `Теги`
  - deal/link-related fields

## Data Flow

Implement the flow in this order:

1. Cash register token entry and dictionary loading.
2. Client phone search and customer selection.
3. Selection of organization, paybox, warehouse, and price type.
4. Product search, add-to-cart, quantity and price editing.
5. Sale submission for:
   - create sale
   - create and conduct

## API and Validation

- Never trust task examples blindly; derive exact contracts from API docs or captured responses.
- The canonical create route is `POST /api/v1/docs_sales/?token=...`.
- The canonical request body is an array of `Create` items, not a single object.
- Normalize API responses into app-friendly types before they reach UI components.
- Prefer explicit mapping functions over passing raw API objects through the app.
- Guard against missing dictionaries, empty search results, duplicate cart items, and stale token state.
- Default `operation` to `Заказ` unless the user flow explicitly supports switching to `Реализация`.
- Treat the Google Doc payload as a useful sample, but not as proof of submit semantics such as how `status` maps to "conducted".

## Code Quality

- Use strict TypeScript.
- Do not use `any` unless there is no practical alternative and it is isolated.
- Prefer server-side proxying if CORS, auth, or payload shaping is uncertain.
- Use concise comments only where logic is non-obvious.
- Keep files small and responsibility-focused.

## Verification

Before considering work complete:

1. Run linting and type-checking.
2. Test the full happy path locally.
3. Add focused tests for schema parsing and payload assembly.
4. Verify the mobile layout at a narrow viewport.

## Source Material

- Product brief: `task.txt`
- Task-specific agent instructions: `.codex/skills/tablecrm-mobile-order/SKILL.md`
- Live inspection notes: `.codex/skills/tablecrm-mobile-order/references/live-inspection.md`
