// PR1 stub: hosts only the `MovementType` enum so `MovementModel.ts` and the
// `modules/interfaces/movement.interface.ts` compatibility shim can import it
// without a circular/missing dependency. The full `Movement` aggregate
// (invariants, `create`/`rehydrate`, `MovementProps`) lands in PR2.
export enum MovementType {
    INGRESO = 'ingreso', // EN: Income
    EGRESO = 'egreso', // EN: Expense
}
