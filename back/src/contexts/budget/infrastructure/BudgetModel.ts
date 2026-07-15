import mongoose, { Schema } from 'mongoose';

// PR1 is a pure compatibility shim: this file becomes the SOLE
// `mongoose.model('Budget', ...)` registration going forward, replacing the
// legacy `modules/models/Budget.model.ts` schema definition (that file is
// now a re-export shim pointing here — see its own comment). The legacy
// `modules/interfaces/budget.interface.ts` is left untouched (still
// consumed only by the legacy `budget.service.ts`, until both are deleted
// in PR4) — no interface shim is needed here (design D10 — `BudgetI` has
// zero out-of-scope consumers). A domain-owned read model (`BudgetView`)
// replaces this on the read path once PR2a introduces the `Budget`
// aggregate, `BudgetMapper`, and `MongooseBudgetRepository` (see design
// D2, D3, D8).
export interface BudgetDocument {
    Category: Schema.Types.ObjectId;
    Month: number;
    Year: number;
    Limit: number;
    _id?: Schema.Types.ObjectId;
}

const BudgetSchema: Schema = new Schema<BudgetDocument>(
    {
        Category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        Month: { type: Number, required: true, min: 1, max: 12 },
        Year: { type: Number, required: true },
        Limit: { type: Number, required: true, min: 0 },
    },
    {
        timestamps: true,
        validateBeforeSave: true,
        versionKey: false,
        autoIndex: true,
    },
);

BudgetSchema.index({ Category: 1, Month: 1, Year: 1 }, { unique: true });

export default mongoose.model<BudgetDocument>('Budget', BudgetSchema);
