# auth-config Specification

## Purpose

Defines startup-time validation rules for JWT configuration in `src/config/auth.config.ts`. All guards MUST throw synchronously at module load (fail-fast), consistent with the existing `required()` pattern.

## Requirements

### Requirement: AUTH-CFG-01 — JWT_SECRET minimum length guard

After confirming `JWT_SECRET` is present, `authConfig` MUST throw a descriptive `Error` at module load if `JWT_SECRET.length < 32`. The error message MUST name the variable and state the minimum length.

#### Scenario: Valid JWT_SECRET length

- GIVEN `JWT_SECRET` is set to a string of 32 or more characters
- WHEN `authConfig` is imported
- THEN the module initializes without error and `authConfig.jwtSecret` holds the value

#### Scenario: JWT_SECRET too short

- GIVEN `JWT_SECRET` is set to a string shorter than 32 characters
- WHEN `authConfig` is imported
- THEN the process throws an `Error` whose message contains `"JWT_SECRET"` and `"32"`
- AND the server does not start

#### Scenario: JWT_SECRET absent — existing guard fires first

- GIVEN `JWT_SECRET` is not set in the environment
- WHEN `authConfig` is imported
- THEN the existing `required('JWT_SECRET')` guard throws before the length check is reached
- AND only one error is thrown (no duplicate)

### Requirement: AUTH-CFG-02 — JWT_EXPIRES_IN format validation

When `JWT_EXPIRES_IN` is present, `authConfig` MUST validate it against `^\d+[smhd]$` before accepting it. A non-matching value MUST throw a descriptive `Error` at module load naming the variable and the accepted format.

#### Scenario: Valid JWT_EXPIRES_IN values

- GIVEN `JWT_EXPIRES_IN` is set to `1d`, `30m`, `3600s`, or `24h`
- WHEN `authConfig` is imported
- THEN the module initializes and `authConfig.jwtExpiresIn` holds the exact value

#### Scenario: Invalid JWT_EXPIRES_IN format

- GIVEN `JWT_EXPIRES_IN` is set to an invalid string — examples: `1 day`, `24`, `1w`, `2h30m`, empty string
- WHEN `authConfig` is imported
- THEN the process throws an `Error` whose message contains `"JWT_EXPIRES_IN"` and the accepted pattern
- AND the server does not start

#### Scenario: JWT_EXPIRES_IN absent — default applies

- GIVEN `JWT_EXPIRES_IN` is not set in the environment
- WHEN `authConfig` is imported
- THEN `authConfig.jwtExpiresIn` defaults to `"1d"` and no error is thrown

### Requirement: AUTH-CFG-03 — ERR-03 affected_files accuracy

`tasks.json` entry `ERR-03` MUST include `src/modules/controllers/auth.controller.ts` in its `affected_files` array, because the auth controller shares the same error-mapping problem (all errors return 500) documented in that task.

#### Scenario: ERR-03 affected_files missing auth.controller.ts

- GIVEN ERR-03 `affected_files` does not include `auth.controller.ts`
- WHEN the change is applied
- THEN `auth.controller.ts` is appended to `affected_files` without changing ERR-03 status, priority, or any other field
