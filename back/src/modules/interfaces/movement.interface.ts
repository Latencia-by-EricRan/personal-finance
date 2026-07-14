// Compatibility shim: `MovementType`/`MovementDocument` now live in
// `src/contexts/movement/{domain/Movement,infrastructure/MovementModel}.ts`.
// `MovementType as TypeMovement` is a VALUE re-export (the enum keeps its
// runtime object) so `account.service.ts` and `recurring.service.ts` keep
// using `.EGRESO`/`.INGRESO` (`report.service.ts` was repointed straight to
// the `contexts/movement` barrel in PR4 and no longer uses this shim).
// `MovementDocument`
// matches the legacy `MovementI` field-for-field (incl. `Category?:
// Types.ObjectId`, no `_id`), so `account.service.transfer`'s
// `(x as {_id})._id` cast and `recurring.interface.ts`'s `Type: TypeMovement`
// compile unchanged.
export { MovementType as TypeMovement } from '../../contexts/movement/domain/Movement';
export type { MovementDocument as MovementI } from '../../contexts/movement/infrastructure/MovementModel';
