import mongoose, { Schema } from 'mongoose';

// This file is the SOLE `mongoose.model('Account', ...)` registration,
// replacing the legacy `modules/models/Account.model.ts` schema definition
// (that file is now a re-export shim pointing here — see its own comment).
// The legacy `modules/interfaces/account.interface.ts` and
// `modules/services/account.service.ts` were deleted in PR4; the PR1
// carveout that kept an `_id?: Schema.Types.ObjectId` field on
// `AccountDocument` solely for that legacy consumer's compile compatibility
// has been removed accordingly. `Recurring.model.ts`'s `ref:'Account'` and
// `MovementModel.ts`'s `ref:'Account'` are string refs resolved by the
// preserved registration name, unaffected by this file's location.
// `scripts/seed.ts`, `scripts/backfill-movement-accounts.ts`, and the e2e
// suites import the model directly through the retained
// `modules/models/Account.model.ts` shim — all keep working unchanged. The
// domain-owned
// read model (`AccountView`) is the read path, introduced in PR2a via the
// `Account` aggregate, `AccountMapper`, and `MongooseAccountRepository`
// (see design D2, D3, D7).
export type AccountType = 'efectivo' | 'banco' | 'tarjeta';

export interface AccountDocument {
    Name: string;
    Type: AccountType;
    Currency: string;
    Icon: string;
    Archived: boolean;
}

const AccountSchema: Schema = new Schema<AccountDocument>({
    Name: { type: String, required: true },
    Type: { type: String, enum: ['efectivo', 'banco', 'tarjeta'], required: true },
    Currency: { type: String, default: 'ARS' },
    Icon: { type: String, default: '' },
    Archived: { type: Boolean, default: false },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    validateBeforeSave: true,
    versionKey: false, // Deletes the version key (__v)
    autoIndex: true, // Auto indexing
});

export default mongoose.model<AccountDocument>('Account', AccountSchema);
