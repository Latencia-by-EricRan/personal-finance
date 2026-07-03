# api-documentation Specification

## Purpose

Defines the required content of the hand-written `openapi.yaml` spec (source of truth, repo root) and the runtime behavior of `GET /docs` (Swagger UI), so the API's real behavior — including its existing quirks — becomes machine-readable and browsable. This capability is documentation-only: it MUST NOT change any controller, validator, service, route, or model behavior.

## Requirements

### Requirement: API-DOC-01 — Complete endpoint inventory

`openapi.yaml` MUST exist at the repository root and MUST describe exactly 14 operations: `POST /auth/login`; under `/movement` — `GET /movement/month`, `GET /movement/summary/{month}/{year}`, `GET /movement/{startDate}/{endDate}`, `POST /movement/{startDate}/{endDate}`, `POST /movement/`, `POST /movement/save`, `PUT /movement/{id}`, `DELETE /movement/{id}`; under `/category` — `GET /category/`, `GET /category/{id}`, `POST /category/`, `POST /category/save`, `DELETE /category/{id}`.

#### Scenario: Endpoint count matches exactly

- GIVEN `openapi.yaml` is parsed
- WHEN the `paths` object is enumerated by path+method
- THEN exactly 14 path+method combinations exist, matching the list above

#### Scenario: Same path, two verbs, both documented

- GIVEN the `paths` entry for `/movement/{startDate}/{endDate}`
- WHEN both `get` and `post` operations are inspected
- THEN each is present as a distinct operation object with its own description

### Requirement: API-DOC-02 — /docs public availability, no environment gating

`GET /docs` MUST return HTTP 200 with the Swagger UI, MUST NOT require an `Authorization` header, and MUST behave identically regardless of `NODE_ENV`.

#### Scenario: Docs reachable without auth

- GIVEN no `Authorization` header is sent
- WHEN a client sends `GET /docs`
- THEN the response status is 200 and the body is the Swagger UI HTML

#### Scenario: Docs reachable in every environment

- GIVEN `NODE_ENV` is `production`, `development`, or unset
- WHEN a client sends `GET /docs`
- THEN the response status is 200 in all three cases

### Requirement: API-DOC-03 — bearerAuth scope

`openapi.yaml` MUST define `components.securitySchemes.bearerAuth` (`type: http`, `scheme: bearer`, `bearerFormat: JWT`) and apply it as a `security` requirement to every operation under `/movement/*` and `/category/*`. `POST /auth/login` MUST NOT declare `bearerAuth` or any other security requirement.

#### Scenario: All movement and category operations require bearerAuth

- GIVEN each operation under `/movement` and `/category`
- WHEN its `security` field is inspected
- THEN it contains `bearerAuth`

#### Scenario: Login operation has no security requirement

- GIVEN the `POST /auth/login` operation
- WHEN its `security` field is inspected
- THEN it is absent or empty

### Requirement: API-DOC-04 — Summary response documents the `mount` field verbatim

The documented response schema for `GET /movement/summary/{month}/{year}` MUST name the nested field `mount` (not `amount`) inside both `summary.income` and `summary.expense`, matching current runtime behavior exactly.

#### Scenario: Schema uses mount, not amount

- GIVEN the response schema for `GET /movement/summary/{month}/{year}`
- WHEN `summary.income` and `summary.expense` properties are inspected
- THEN each contains a property literally named `mount`
- AND no property named `amount` exists in that schema

### Requirement: API-DOC-05 — Delete-movement response is a bare string

The documented response schema for `DELETE /movement/{id}` MUST be `type: string`, not an object schema, matching the controller's bare-string response body.

#### Scenario: Delete response schema is a bare string

- GIVEN the 200 response schema for `DELETE /movement/{id}`
- WHEN its `type` field is inspected
- THEN it is `string`, with no `properties` object

### Requirement: API-DOC-06 — Category create body documents oneOf with a bulk-use caveat

The documented request body for `POST /category/` MUST be `oneOf: [Category, array of Category]`, and its description MUST caveat that bulk creation should use `POST /category/save` instead, because array bodies posted to `POST /category/` are not correctly persisted by the current service implementation.

#### Scenario: Request body schema is oneOf

- GIVEN the request body schema for `POST /category/`
- WHEN it is inspected
- THEN it is a `oneOf` of a single `Category` object and an array of `Category` objects

#### Scenario: Description warns against relying on array bodies

- GIVEN the `POST /category/` operation description
- WHEN it is read
- THEN it states that bulk creation should use `POST /category/save`, and that array bodies to this endpoint are not correctly persisted

### Requirement: API-DOC-07 — Pagination params and bare-array responses with no count metadata

`GET /movement/{startDate}/{endDate}` and `GET /category/` MUST document `page` (default 1) and `limit` (default 50, max 200) query parameters, and their success response schemas MUST be bare arrays with no `total`/`count`/pagination-metadata field.

#### Scenario: Pagination params documented with correct defaults and bounds

- GIVEN the `parameters` for either endpoint
- WHEN `page` and `limit` are inspected
- THEN `page` defaults to `1` and `limit` defaults to `50` with a documented maximum of `200`

#### Scenario: Response schema is a bare array

- GIVEN the 200 response schema for either endpoint
- WHEN it is inspected
- THEN its `type` is `array` and no sibling `total`, `count`, or pagination-metadata property exists

### Requirement: API-DOC-08 — Uniform error response schema

Every documented error response (4xx/5xx) across all 14 operations MUST use the schema `{ message: string, errors?: string[] }`.

#### Scenario: Error schema is consistent across operations

- GIVEN any documented non-2xx response in `openapi.yaml`
- WHEN its schema is inspected
- THEN it has a required `message` string property and an optional `errors` array-of-strings property, with no other required properties

### Requirement: API-DOC-09 — /docs shares the global rate limiter

`/docs` MUST remain reachable under the existing global rate limiter (no route-specific exemption). Mounting `/docs` MUST NOT alter the limiter's configuration or its application to any other route.

#### Scenario: Docs requests count toward the shared limit

- GIVEN the global rate limiter is configured at its existing threshold
- WHEN repeated `GET /docs` requests are made from the same IP
- THEN they are throttled under the same limiter as other routes once the threshold is exceeded, with no exemption applied

### Requirement: API-DOC-10 — No behavior change to existing code paths

Adding `openapi.yaml` and the `/docs` route MUST NOT change any existing controller, validator, service, route, or model behavior. All 14 documented operations MUST continue to behave, byte-for-byte, exactly as they did before this capability was added.

#### Scenario: Existing endpoint responses are unchanged

- GIVEN any of the 14 documented operations and a fixed request
- WHEN the request is sent before and after this capability is added
- THEN the response status, body, and headers are identical in both cases
