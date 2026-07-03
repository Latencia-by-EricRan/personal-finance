import { Schema } from 'mongoose';

export interface BudgetI {
    Category: Schema.Types.ObjectId;
    Month: number;
    Year: number;
    Limit: number;
    _id?: Schema.Types.ObjectId;
}
