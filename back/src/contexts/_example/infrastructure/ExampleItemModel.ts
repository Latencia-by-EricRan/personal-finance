import mongoose, { Schema, Types } from 'mongoose';

export interface ExampleItemDocument {
    _id: Types.ObjectId;
    Name: string;
    Quantity: number;
}

const ExampleItemSchema: Schema = new Schema<ExampleItemDocument>({
    Name: { type: String, required: true },
    Quantity: { type: Number, required: true },
}, {
    versionKey: false,
});

export default mongoose.model<ExampleItemDocument>('ExampleItem', ExampleItemSchema);
