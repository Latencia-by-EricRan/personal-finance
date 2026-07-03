import mongoose, { Schema } from 'mongoose';
import { BudgetI } from '../interfaces/budget.interface';

const BudgetSchema: Schema = new Schema<BudgetI>(
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

export default mongoose.model<BudgetI>('Budget', BudgetSchema);
