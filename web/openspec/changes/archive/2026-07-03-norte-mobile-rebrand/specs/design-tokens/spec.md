# Delta for Design Tokens

## ADDED Requirements

### Requirement: Clean Build

`src/styles.css`/`src/styles.scss` MUST compile without Sass errors.

#### Scenario: Build succeeds
- WHEN `bun run build` (or `bun install` + build) runs
- THEN it MUST complete with no Sass import errors

### Requirement: Norte Design Tokens

Norte design tokens MUST exist as CSS custom properties, defined for both light and dark modes.

#### Scenario: Tokens available in both modes
- GIVEN the token stylesheet is loaded
- WHEN the app is in light mode
- THEN light-mode token values apply
- AND WHEN the app is in dark mode
- THEN dark-mode token values apply instead

### Requirement: No Hardcoded Colors

Once tokens exist, no component MUST reference a raw hardcoded color value (e.g. `cadetblue` or an equivalent literal hex/named color) in `movement-card`, `summary-by-month`, or `movement-summary`.

#### Scenario: cadetblue removed
- GIVEN the styles of `movement-card`, `summary-by-month`, and `movement-summary` after this change
- WHEN searching for `cadetblue` or other raw color literals
- THEN none MUST be found — all color values MUST reference a design token
