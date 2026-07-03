# API reference — norte-mobile-rebrand

Verified endpoint map from `personal-finance.postman.json` (backend repo), captured during this change's exploration. Base URL variable `{{baseUrl}}` = `http://localhost:3000`. Every endpoint below requires `Authorization: Bearer {{token}}` except **Auth** and **Docs**.

## Auth (no token)

- `POST /auth/login` — Body: `{ "Email": "user@example.com", "Password": "changeme" }`. Response includes `token` (JWT) + `expiresIn`.

## Account

- `GET /account` — list (excludes archived unless `?includeArchived=true`)
- `GET /account/:id`
- `GET /account/:id/balance`
- `POST /account` — Body: `{ "Name": "Cash", "Type": "efectivo" | "banco" | "tarjeta", "Currency": "ARS", "Icon": "💵" }`
- `PUT /account/:id` — partial body
- `DELETE /account/:id` — archive (soft-delete), restorable via `PUT`
- `POST /account/transfer` — Body: `{ "From": "<id>", "To": "<id>", "Amount": 1000, "Date": "...", "Description": "..." }`. Backend rejects: same account, non-positive amount, missing/archived accounts.

## Category

- `GET /category`
- `GET /category/:id`
- `POST /category` — Body: `{ "Name": "...", "Description": "...", "Type": "variable" | "fijo", "Tag": "...", "Icon": "..." }`
- `POST /category/save` — bulk array
- `DELETE /category/:id` — hard delete

## Movement

- `GET /movement/month` — current month
- `GET /movement/summary/:month/:year`
- `GET|POST /movement/:startDate/:endDate` — POST body is optional filters: `{ "Type": "egreso", "Category": "<id>", "Account": "<id>" }`
- `POST /movement` — Body: `{ "Type": "ingreso"|"egreso", "Amount": 1500, "Category": "<id>", "Account": "<id>", "Date": "...", "Description": "...", "Card": "" }`. **Category required on create** (API validator), Account always required (Mongoose schema).
- `POST /movement/save` — bulk array
- `PUT /movement/:id` — partial body
- `DELETE /movement/:id`

## Budget / Recurring / Report

Out of scope for `norte-mobile-rebrand` (deferred to `front-web`), listed here only for completeness — do not build UI against these in this change:
- Budget: `GET /budget`, `/:id`, `/status/:month/:year`, `POST`, `PUT /:id`, `DELETE /:id`
- Recurring: `GET /recurring`, `/:id`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /recurring/run`
- Report: `GET /report/by-category/:month/:year`, `/monthly/:year`, `/cashflow/:month/:year`

## Notes for implementation

- Field names are PascalCase (`Amount`, `Category`, `Account`) — matches existing `IMovement`/`ICategory` models in the frontend already.
- IDs are Mongo `_id` strings.
- 401 on any protected call (missing/expired/invalid token) → must trigger the interceptor's/guard's re-auth flow per the auth spec.
