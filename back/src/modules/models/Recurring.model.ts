import mongoose, { Schema } from 'mongoose';
import { RecurringI } from '../interfaces/recurring.interface';

const RecurringSchema: Schema = new Schema<RecurringI>(
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

export default mongoose.model<RecurringI>('Recurring', RecurringSchema);
