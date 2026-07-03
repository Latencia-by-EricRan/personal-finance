import { Schema, Types } from 'mongoose';
import { TypeMovement } from './movement.interface';

export interface RecurringI {
    Type: TypeMovement;
    Amount: number;
    Category: Types.ObjectId;
    Account: Types.ObjectId;
    Description?: string;
    Card?: string;
    Frequency: 'mensual';
    DayOfMonth: number;
    Active?: boolean;
    LastRunYearMonth?: string | null;
    _id?: Schema.Types.ObjectId;
}
