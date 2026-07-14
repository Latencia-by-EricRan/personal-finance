import mongoose, { Schema } from 'mongoose';

// PR1 is a pure compatibility shim: this file becomes the SOLE
// `mongoose.model('Account', ...)` registration going forward, replacing the
// legacy `modules/models/Account.model.ts` schema definition (that file is
// now a re-export shim pointing here — see its own comment). The legacy
// `modules/interfaces/account.interface.ts` is left untouched (still
// consumed only by the legacy `account.service.ts`, until both are deleted
// in PR4) — no full type-alias shim like movement's `MovementI` is needed
// here. The `_id?: Schema.Types.ObjectId` field below exists ONLY to keep
// `account.service.ts` compiling: it types its returns against the legacy
// `AccountI` (which declares that same, structurally-nonstandard `_id`
// type), and TS's assignability check needs the two shapes to line up until
// PR4 deletes that consumer. Existing consumers that resolve the model by
// registration name only — `recurring.service.ts`, `Recurring.model.ts`'s
// `ref:'Account'`, `MovementModel.ts`'s `ref:'Account'`, `scripts/seed.ts`,
// and the e2e suites — keep working unchanged regardless. A domain-owned
// read model (`AccountView`) replaces this on the read path once PR2a
// introduces the `Account` aggregate, `AccountMapper`, and
// `MongooseAccountRepository` (see design D2, D3, D7).
export type AccountType = 'efectivo' | 'banco' | 'tarjeta';

export interface AccountDocument {
    Name: string;
    Type: AccountType;
    Currency: string;
    Icon: string;
    Archived: boolean;
    _id?: Schema.Types.ObjectId;
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
