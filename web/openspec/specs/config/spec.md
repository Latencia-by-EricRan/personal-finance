# Delta for Config

## ADDED Requirements

### Requirement: Environment-Based API URL

The API base URL MUST be sourced from `src/environments/` files, selected per build target via Angular `fileReplacements`, and MUST NOT be a literal inside any service.

#### Scenario: Dev build uses dev environment
- GIVEN a default (`ng serve` / dev) build
- WHEN any service resolves the API base URL
- THEN it MUST read it from `environment.apiUrl` (dev file)

#### Scenario: Prod build uses prod environment
- GIVEN a production build (`ng build --configuration production`)
- WHEN any service resolves the API base URL
- THEN it MUST read it from the prod environment file via `fileReplacements`
- AND the dev URL MUST NOT appear in the prod bundle

#### Scenario: No hardcoded literals remain
- GIVEN the codebase after this change
- WHEN searching services for the API host literal (e.g. `http://localhost:3000`)
- THEN no service MUST contain it directly — all MUST reference `environment.apiUrl`
