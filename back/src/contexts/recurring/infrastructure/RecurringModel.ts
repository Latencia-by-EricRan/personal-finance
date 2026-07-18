import mongoose, { Schema } from 'mongoose';

/**
 * New `mongoose.model('Recurring', ...)` registration for the hexagonal
 * context, schema-identical to legacy `modules/models/Recurring.model.ts`.
 * The legacy file keeps its OWN independent registration until PR1b deletes
 * it (task 2.7) — safe here because this PR1a infra is never imported by the
 * running app (no composition-root/`_routes.ts` wiring, out of scope per
 * design D12/D16) and each Vitest test file gets its own isolated module
 * registry, so the two registrations never collide within the same process.
 * Do NOT wire this into the app before the legacy registration is deleted,
 * or `OverwriteModelError` will occur at boot.
 */
export interface RecurringDocument {
    Type: string;
    Amount: number;
    Category: Schema.Types.ObjectId;
    Account: Schema.Types.ObjectId;
    Description?: string;
    Card?: string;
    Frequency: string;
    DayOfMonth: number;
    Active: boolean;
    LastRunYearMonth: string | null;
}

const RecurringSchema: Schema = new Schema<RecurringDocument>(
    {
        Type: { type: String, enum: ['ingreso', 'egreso'], required: true },
        Amount: { type: Number, required: true },
        Category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        Account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
        Description: { type: String, default: '' },
        Card: { type: String, default: '' },
        Frequency: { type: String, enum: ['mensual'], required: true, default: 'mensual' },
        DayOfMonth: { type: Number, required: true, min: 1, max: 31 },
        Active: { type: Boolean, default: true },
        LastRunYearMonth: { type: String, default: null },
    },
    {
        timestamps: true,
        versionKey: false,
        autoIndex: true,
    },
);

export default mongoose.model<RecurringDocument>('Recurring', RecurringSchema);
