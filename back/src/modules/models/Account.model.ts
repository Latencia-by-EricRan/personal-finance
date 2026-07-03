import mongoose, { Schema } from 'mongoose';
import { AccountI } from '../interfaces/account.interface';


const AccountSchema: Schema = new Schema<AccountI>({
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


export default mongoose.model<AccountI>('Account', AccountSchema);
