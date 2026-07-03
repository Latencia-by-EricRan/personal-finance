# Delta for Accounts and Categories

## ADDED Requirements

### Requirement: List Categories

`CategoryService` MUST provide a method to list all categories from the API.

#### Scenario: List returns available categories
- WHEN the list method is called
- THEN a `GET` request is sent to the category endpoint
- AND the list of categories is returned

### Requirement: List Accounts

`AccountService` MUST provide a method to list all accounts from the API.

#### Scenario: List returns available accounts
- WHEN the list method is called
- THEN a `GET` request is sent to the account endpoint
- AND the list of accounts is returned

### Requirement: Account Balance

`AccountService` MUST provide a method to retrieve the current balance of a given account.

#### Scenario: Balance for existing account
- GIVEN a valid account id
- WHEN the balance method is called
- THEN the account's current balance is returned

### Requirement: Transfer Between Accounts

`AccountService` MUST support transferring a positive amount between two DIFFERENT, existing, non-archived accounts, and MUST reject invalid transfer requests before hitting the API where feasible, mirroring backend validation.

#### Scenario: Valid transfer
- GIVEN two different, existing, non-archived accounts and a positive amount
- WHEN transfer is called
- THEN a request is sent to the transfer endpoint
- AND both account balances are reflected as changed afterward

#### Scenario: Same-account transfer rejected
- GIVEN source and destination account are the same
- WHEN transfer is attempted
- THEN the request MUST NOT be sent
- AND a validation error MUST surface

#### Scenario: Non-positive amount rejected
- GIVEN the transfer amount is zero or negative
- WHEN transfer is attempted
- THEN the request MUST NOT be sent
- AND a validation error MUST surface

#### Scenario: Missing or archived account rejected
- GIVEN the destination account is missing or archived
- WHEN transfer is attempted
- THEN the API rejection MUST be surfaced to the user as an error
- AND no balance change MUST be assumed client-side

### Requirement: Cuentas Screen — List with Balance

The Cuentas screen MUST list all accounts, each showing its current balance.

#### Scenario: Accounts render with balances
- GIVEN the user navigates to Cuentas
- WHEN the accounts load
- THEN each account row MUST show its name and current balance

### Requirement: Cuentas Screen — Transfer UI

The Cuentas screen MUST offer a transfer action (e.g. a sheet/modal) that lets the user pick source account, destination account, and amount, and submits via `AccountService.transfer()`.

#### Scenario: Successful transfer via UI
- GIVEN valid different source/destination accounts and a positive amount entered in the transfer UI
- WHEN the user confirms
- THEN `AccountService.transfer()` is called with those values
- AND on success the account list balances refresh

#### Scenario: Invalid transfer input blocked in UI
- GIVEN the user selects the same account as source and destination, or enters a non-positive amount
- WHEN the user attempts to confirm
- THEN the UI MUST block submission and show a validation message
