# Delta for Movement Filter

## ADDED Requirements

### Requirement: Filter by Type/Category/Account

The `movement-filter` component MUST let the user filter the visible movement list by type, category, and account, individually or combined.

#### Scenario: Filter by type only
- GIVEN the user selects a type filter (ingreso/egreso)
- WHEN the filter is applied
- THEN only movements of that type are shown

#### Scenario: Filter by category and account combined
- GIVEN the user selects both a category and an account filter
- WHEN the filter is applied
- THEN only movements matching BOTH criteria are shown

### Requirement: Empty Result State

When a filter combination matches no movements, the UI MUST show an explicit empty state rather than a blank list.

#### Scenario: No matches
- GIVEN a filter combination with zero matching movements
- WHEN the filter is applied
- THEN an empty-state message MUST render
- AND no error MUST be thrown
