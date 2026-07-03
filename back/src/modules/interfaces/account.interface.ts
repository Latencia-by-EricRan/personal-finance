import { Schema } from 'mongoose';

export interface AccountI {
    Name: string;
    Type: 'efectivo' | 'banco' | 'tarjeta';
    Currency: string;
    Icon?: string;
    Archived: boolean;
    _id?: Schema.Types.ObjectId;
}
