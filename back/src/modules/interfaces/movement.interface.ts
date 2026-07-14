// Compatibility shim: `MovementType`/`MovementDocument` now live in
// `src/contexts/movement/{domain/Movement,infrastructure/MovementModel}.ts`.
// `MovementType as TypeMovement` is a VALUE re-export (the enum keeps its
// runtime object) so `recurring.interface.ts`'s `Type: TypeMovement` field
// compiles unchanged (`report.service.ts` was repointed straight to the
// `contexts/movement` barrel in movement's PR4, and the layer-first
// `account.service.ts` was deleted in account's PR4 — neither uses this
// shim anymore). `MovementDocument as MovementI` is a type re-export
// matching the legacy shape field-for-field (incl. `Category?:
// Types.ObjectId`, no `_id`), consumed by `recurring.service.ts`.
export { MovementType as TypeMovement } from '../../contexts/movement/domain/Movement';
export type { MovementDocument as MovementI } from '../../contexts/movement/infrastructure/MovementModel';
