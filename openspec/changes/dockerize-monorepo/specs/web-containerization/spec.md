# Web Containerization Specification

## Purpose

Defines the observable behavior required for `web/` (the Angular 19 SSR app) to build and run correctly inside a Docker container, including the SSR-safe API host resolution needed because SSR runs server-side network calls inside the container.

## Requirements

### Requirement: Buildable web container image

`web/` MUST have a Dockerfile that produces a runnable container image of the SSR application, mirroring `back/`'s multi-stage `dev`/`prod` split.

#### Scenario: Image builds successfully

- GIVEN `web/Dockerfile` exists
- WHEN `docker build` (or `docker compose build`) runs against the `web/` context
- THEN the build MUST complete without error and produce a runnable image

#### Scenario: Dev and prod targets are both available

- GIVEN `web/Dockerfile` defines multiple build stages
- WHEN a target is selected (`dev` or `prod`)
- THEN the resulting image MUST run the app in the mode corresponding to that target

### Requirement: Excluded build context

`web/` MUST have a `.dockerignore` file that prevents local build artifacts and dependency directories from being sent into the Docker build context.

#### Scenario: node_modules and build output are excluded

- GIVEN `web/.dockerignore` exists
- WHEN the Docker build context is assembled for `web/`
- THEN `node_modules/`, `dist/`, and `.angular/` MUST NOT be included in the context sent to the Docker daemon

### Requirement: Context-aware API host resolution

The `web` app MUST resolve the backend API host differently depending on execution context: server-side (SSR) code MUST reach `back` by its Docker service name, while browser-side code MUST continue reaching `back` via the host-published address.

#### Scenario: SSR request reaches the back container, not itself

- GIVEN the `web` container is running in SSR mode inside the root compose stack
- WHEN it renders a page that fetches movements data during server-side rendering
- THEN the outbound request MUST reach the `back` container over the shared Docker network
- AND the request MUST NOT be sent to the `web` container's own loopback address

#### Scenario: Browser request keeps using the published host port

- GIVEN a user's browser has loaded the hydrated `web` app
- WHEN the browser makes a client-side request for movements data
- THEN the request MUST be sent to `http://localhost:3000`, the host-published `back` port

#### Scenario: SSR render does not fail with a connection error

- GIVEN the root compose stack is running with `web` and `back` on the shared network
- WHEN a page that fetches data on the server is requested from the host browser
- THEN the SSR render MUST complete without a connection-refused error caused by an incorrect API host
