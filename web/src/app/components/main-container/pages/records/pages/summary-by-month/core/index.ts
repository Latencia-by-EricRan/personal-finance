// Per-feature Material module for summary-by-month. MovementService + movement
// models were relocated to records/core (ADR-4); the temporary compat
// re-export that used to live here was retired in Fase 2 once movement-card
// and movement-summary were updated to import IMovement/ISummary directly
// from records/core.
export * from './angular-material/angular-material.module';
