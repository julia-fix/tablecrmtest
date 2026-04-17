# Live Inspection Notes

Inspected on April 17, 2026 via Playwright.

## Sources Inspected

- `https://app.tablecrm.com/docs_sales?token=...`
- `https://app.tablecrm.com/api/v1/docs`
- `https://tablecrm-mobile-order.vercel.app`
- `https://ui.shadcn.com/examples/dashboard`

## Reference App Findings

The public example app uses this mobile-first flow:

1. Token connection
2. Customer phone search
3. Sale parameters
4. Product search
5. Cart
6. Comment
7. Sticky total and submit actions

Visible labels and actions:

- `Token`
- `Телефон`
- `Организация`
- `Счёт`
- `Склад`
- `Тип цены`
- `Комментарий`
- `Создать продажу`
- `Создать и провести`

## Production Sale Modal Findings

The TableCRM sale page has a `Новая продажа` button that opens a modal titled `Проведение документа продажи`.

Observed core fields:

- `Контрагент`
- `Счет поступления`
- `Склад отгрузки`
- `Организация`
- `Приоритет`
- `Тип цены`

Observed item-area controls:

- `Выбрать`
- product selection combobox
- disabled quick-add buttons until selection is made

Observed item table columns:

- `Название товара`
- `Сумма`
- `Скидка`
- `Количество`
- `Вес (г)`
- `Единица`
- `Итого`
- `Действие`

Observed totals and payment controls:

- `Без скидки`
- `Скидка`
- `Остаток лояльности`
- `Итого`
- `Баллами`
- `Рублями`

Observed primary actions:

- `Создать и провести`
- `Только создать`

Observed additional parameters modal:

- `Номер`
- `Комментарий`
- `Договор`
- `Теги`
- a deal/linking row with a combobox, ID input, and add button

## API Findings

Swagger serves its schema from:

- `/api/v1/openapi.json`

Relevant list routes:

- `GET /contragents/?token=...`
  - phone search is supported via `phone`
- `GET /warehouses/?token=...`
- `GET /payboxes/?token=...`
- `GET /organizations/?token=...`
- `GET /price_types/?token=...`
- `GET /nomenclature/?token=...`
  - supports `name`
  - supports `with_prices`
  - supports `with_balance`
  - supports `with_photos`
- `GET /units/`

Create-sale route:

- `POST /docs_sales/?token=...`

Create-sale request body schema:

- request body is `CreateMass`
- `CreateMass` is an array of `Create`
- `Create` includes these app-relevant fields:
  - `dated`
  - `operation`
  - `comment`
  - `contragent`
  - `organization`
  - `loyality_card_id`
  - `warehouse`
  - `paybox`
  - `tax_included`
  - `tax_active`
  - `settings`
  - `paid_rubles`
  - `paid_lt`
  - `status`
  - `goods`
  - `priority`
- `operation` enum:
  - `Заказ`
  - `Реализация`

Goods item schema:

- `price`
- `quantity`
- `unit`
- `discount`
- `sum_discounted`
- `nomenclature`
- optional `price_type`
- optional `nomenclature_name`

Important caution:

- The example payload in `googledoc.txt` is consistent with the schema shape.
- It is not sufficient to infer all submit semantics, especially for `status` and conduct behavior.

## Data Shape Findings

- `OrganizationListGet`, `WarehouseListGet`, `PriceTypeListGet`, `UnitListGet`, and `GetPayments` all return `result` arrays plus `count`.
- `NomenclatureListGetRes` returns `result` plus `count`.
- `NomenclatureGet` can include:
  - `unit`
  - `unit_name`
  - `prices`
  - `balances`
  - `photos`
- `Payboxes` includes `organization_id`, which can be useful for filtering or labeling.

## UI Guidance From shadcn

- The referenced shadcn dashboard example is desktop-oriented and information-dense.
- Use it as a component vocabulary reference, not as a page template for the mobile order form.
