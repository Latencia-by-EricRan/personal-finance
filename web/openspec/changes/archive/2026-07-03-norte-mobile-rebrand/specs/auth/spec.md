# Delta for Auth

## ADDED Requirements

### Requirement: Login

The system MUST authenticate a user against `POST /auth/login` using email and password, and MUST store the returned JWT on success.

#### Scenario: Successful login
- GIVEN a user with valid email and password
- WHEN they submit the login form
- THEN the app calls `POST /auth/login` with the credentials
- AND stores the returned JWT
- AND navigates to the authenticated home route

#### Scenario: Invalid credentials
- GIVEN a user submits wrong credentials
- WHEN the API responds 401
- THEN the login form displays an error message
- AND no token is stored

### Requirement: SSR-Safe Token Persistence

The token storage mechanism MUST NOT access `localStorage`/`sessionStorage`/`window` during server-side rendering.

#### Scenario: Server render does not throw
- GIVEN the app is rendered on the server (SSR pass)
- WHEN any service reads or writes the auth token
- THEN it MUST guard the browser-only storage access (e.g. `isPlatformBrowser`)
- AND the render MUST complete without throwing

#### Scenario: Browser persists across reload
- GIVEN a user is logged in in the browser
- WHEN the page is reloaded
- THEN the token MUST still be available from storage after hydration

### Requirement: Bearer Token Interceptor

An HTTP interceptor MUST attach `Authorization: Bearer <token>` to every outgoing request to the API, EXCEPT the login request itself.

#### Scenario: Authenticated request
- GIVEN a stored valid token
- WHEN any HTTP request other than login is sent to the API
- THEN the request MUST include the `Authorization: Bearer <token>` header

#### Scenario: Login request is excluded
- GIVEN no token is stored yet
- WHEN the login request is sent
- THEN the interceptor MUST NOT attach an `Authorization` header

### Requirement: Route Guard

Protected routes MUST be inaccessible to unauthenticated users.

#### Scenario: Unauthenticated access redirected
- GIVEN no valid token is stored
- WHEN the user navigates to a protected route
- THEN the guard MUST redirect to the login route
- AND the protected route MUST NOT activate

#### Scenario: Authenticated access allowed
- GIVEN a valid token is stored
- WHEN the user navigates to a protected route
- THEN the guard MUST allow activation

### Requirement: 401 / Expired Token Handling

The system MUST react to any `401 Unauthorized` API response by treating the session as invalid.

#### Scenario: API returns 401 mid-session
- GIVEN a user is on a protected page with a stored token
- WHEN any API call responds with 401 (expired or invalid token)
- THEN the interceptor or guard MUST clear the stored token
- AND redirect the user to the login route
