import mongoose, { Schema, Types } from 'mongoose';
import { MovementType } from '../domain/Movement';

// PR1 is a pure compatibility shim: it intentionally keeps typing identical to
// the pre-migration model (`mongoose.model<MovementI>(...)`, no `_id`) so
// every existing consumer (account.service.ts, recurring.service.ts,
// report.service.ts, e2e suites) compiles unchanged via the
// `modules/interfaces/movement.interface.ts` shim aliasing
// `MovementDocument as MovementI`. A domain-owned read model (`MovementView`)
// replaces this on the read path once PR2 introduces the `Movement`
// aggregate, `MovementMapper`, and `MongooseMovementRepository` (see design D1,
// D-Mapper).
export interface MovementDocument {
    Type: MovementType;
    Amount: number;
    Date: Date;
    // Optional: transfer-generated movements (AccountService.transfer) have no Category.
    // API-level movement creation still requires it (movement.validator.ts's isPost rule).
    Category?: Types.ObjectId;
    Account: Types.ObjectId;
    TransferId?: string;
    Description?: string;
    Card?: string;
}

const MovementSchema: Schema = new Schema<MovementDocument>({
    Type: { type: String, enum: ['ingreso', 'egreso'], required: true },
    Amount: { type: Number, required: true },
    Date: { type: Date, required: true },
    Category: { type: Schema.Types.ObjectId, ref: 'Category', required: false },
    Account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    TransferId: { type: String, required: false },
    Description: { type: String, default: '' },
    Card: { type: String, default: '' },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    validateBeforeSave: true,
    versionKey: false, // Deletes the version key (__v)
});

export default mongoose.model<MovementDocument>('Movement', MovementSchema);
