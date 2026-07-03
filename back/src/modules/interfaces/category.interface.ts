import { Schema } from 'mongoose';

export interface CategoryI {
    Description: string;
    Name: string;
    Tag: string;
    Type: 'variable' | 'fijo';
    Icon?: string;
    _id?: Schema.Types.ObjectId;
}
