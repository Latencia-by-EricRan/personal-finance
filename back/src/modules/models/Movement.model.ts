import mongoose, { Schema } from 'mongoose';
import { MovementI } from '../interfaces/movement.interface';


const MovementSchema: Schema = new Schema<MovementI>({
    Type: { type: String, enum: ['ingreso', 'egreso'], required: true },
    Amount: { type: Number, required: true },
    Date: { type: Date, required: true },
    // required: false — transfer-generated movements (see AccountService.transfer) are not
    // tied to a spending category; API-level movement creation still enforces Category via
    // movement.validator.ts's isPost rule, so regular client-created movements are unaffected.
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


export default mongoose.model<MovementI>('Movement', MovementSchema);
