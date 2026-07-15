import mongoose, { Schema } from 'mongoose';

// This file is the SOLE `mongoose.model('Budget', ...)` registration,
// replacing the legacy `modules/models/Budget.model.ts` schema definition
// (that file is now a re-export shim pointing here — see its own comment).
// The legacy `modules/interfaces/budget.interface.ts` and
// `modules/services/budget.service.ts` were deleted in PR4; the PR1
// carveout that kept a `_id?: Schema.Types.ObjectId` field on
// `BudgetDocument` solely for that legacy consumer's compile compatibility
// has been removed accordingly. A domain-owned read model (`BudgetView`) is
// the read path, introduced in PR2a via the `Budget` aggregate,
// `BudgetMapper`, and `MongooseBudgetRepository` (see design D2, D3, D8).
//
// NOTE: `Category: Schema.Types.ObjectId` (a SchemaType-descriptor type,
// not a runtime ObjectId value) is copied verbatim from the now-deleted
// legacy `budget.interface.ts` and kept AS-IS — `MongooseBudgetRepository`
// (PR2a) works around this pre-existing quirk locally via a narrow cast
// rather than touching this shared type.
export interface BudgetDocument {
    Category: Schema.Types.ObjectId;
    Month: number;
    Year: number;
    Limit: number;
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
