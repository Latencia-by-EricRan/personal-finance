# Delta for Movement

## ADDED Requirements

### Requirement: Create Movement

`MovementService` MUST support creating a movement, and creation MUST require Type, Amount, Category, Account, and Date.

#### Scenario: Valid creation
- GIVEN Type, positive Amount, Category, Account, and Date are all provided
- WHEN `create()` is called
- THEN a `POST` request is sent to the movement endpoint
- AND the created movement is returned

#### Scenario: Missing Category rejected
- GIVEN Category is omitted
- WHEN creation is attempted
- THEN the request MUST NOT be sent
- AND a validation error MUST surface (Category is required on create, even though the persisted schema allows it null for transfer-generated movements)

#### Scenario: Missing Account rejected
- GIVEN Account is omitted
- WHEN creation is attempted
- THEN the request MUST NOT be sent
- AND a validation error MUST surface

### Requirement: Update Movement

`MovementService` MUST support updating an existing movement by id.

#### Scenario: Successful update
- GIVEN an existing movement id and valid updated fields
- WHEN `update()` is called
- THEN a `PUT`/`PATCH` request is sent with the id and changed fields
- AND the updated movement is returned

### Requirement: Delete Movement

`MovementService` MUST support deleting a movement by id.

#### Scenario: Successful delete
- GIVEN an existing movement id
- WHEN `delete()` is called
- THEN a `DELETE` request is sent for that id
- AND the movement no longer appears in subsequent filtered/summary reads

### Requirement: Filtered Get

`MovementService` MUST support retrieving movements filtered by any combination of type, category, and account.

#### Scenario: Filter by single criterion
- GIVEN a filter with only `type` set
- WHEN the filtered get is called
- THEN only movements matching that type are returned

#### Scenario: Filter with no matches
- GIVEN a filter combination that matches no movement
- WHEN the filtered get is called
- THEN an empty list is returned (not an error)

### Requirement: movement-add Form

The `movement-add` component MUST be a reactive form requiring Type, Amount, Category, Account, and Date, with Description optional, and MUST call `MovementService.create()` on valid submit.

#### Scenario: Valid submission creates a movement
- GIVEN all required fields are filled with valid values
- WHEN the user submits the form
- THEN `MovementService.create()` is invoked with the form values
- AND on success the form resets or navigates away
- AND a success indication is shown

#### Scenario: Invalid submission blocked
- GIVEN any required field is empty or Amount is not a positive number
- WHEN the user attempts to submit
- THEN the submit action MUST be disabled or a no-op
- AND field-level validation errors MUST be visible

#### Scenario: API error surfaced
- GIVEN a valid form submission
- WHEN `MovementService.create()` fails (e.g. network or 4xx/5xx)
- THEN an error message MUST be shown to the user
- AND the form data MUST NOT be silently discarded
