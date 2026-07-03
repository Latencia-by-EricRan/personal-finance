# env-documentation Specification

## Purpose

Defines the required content and format of `.env.example` as the single authoritative reference for environment variable setup. A developer MUST be able to start the server using only `.env.example` as a guide — without reading any source code.

## Requirements

### Requirement: ENV-DOC-01 — Complete .env.example template

The `.env.example` file MUST contain all 7 required environment variables in declaration order, with placeholder values that are clearly non-functional, and an inline comment per variable explaining its purpose and expected format.

| Variable | Comment must cover |
|---|---|
| `MONGO_CONN_STR` | Connection string format |
| `MONGO_DB_NAME` | Target database name |
| `PORT` | HTTP port; default if omitted |
| `AUTH_EMAIL` | Single-user login email |
| `AUTH_PASSWORD_HASH` | bcrypt hash; how to generate it |
| `JWT_SECRET` | Min 32 chars; random string |
| `JWT_EXPIRES_IN` | Format: `<number>[s\|m\|h\|d]`; example value |

#### Scenario: Developer onboards from a clean clone

- GIVEN the developer has no `.env` file and has not read the source code
- WHEN the developer reads `.env.example`
- THEN they can identify all required variables, their purpose, and a valid value format for each

#### Scenario: Developer copies .env.example to start server

- GIVEN the developer copies `.env.example` to `.env` and fills in real values following the comments
- WHEN `npm run dev` is executed
- THEN the server starts without errors related to missing environment variables

#### Scenario: Comment warns about JWT_SECRET minimum length

- GIVEN a developer reads the `JWT_SECRET` line in `.env.example`
- WHEN they set `JWT_SECRET` to a string with fewer than 32 characters
- THEN the inline comment MUST have warned them about the 32-character minimum, making the startup failure predictable

#### Scenario: Comment explains how to generate AUTH_PASSWORD_HASH

- GIVEN a developer needs to set `AUTH_PASSWORD_HASH`
- WHEN they read the comment for that variable
- THEN the comment references `npm run hash-password <plain>` as the generation command

### Requirement: ENV-DOC-02 — TOOL-08 re-closure validity

TOOL-08 in `tasks.json` MUST only be in `done` status when `.env.example` is non-empty and satisfies ENV-DOC-01. A `done` status with an empty file is invalid and MUST be corrected by reopening the task (`pending`) before re-closing.

#### Scenario: TOOL-08 closed with empty file

- GIVEN TOOL-08 status is `done` but `.env.example` is 0 bytes
- WHEN the change is applied
- THEN TOOL-08 is reopened to `pending`, `.env.example` is populated, and TOOL-08 is re-closed to `done` with a non-empty `notes` field referencing the populated file
