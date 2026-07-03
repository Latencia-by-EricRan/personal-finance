import mongoose, { Schema } from 'mongoose';
import { CategoryI } from '../interfaces/category.interface';


const CategorySchema: Schema = new Schema<CategoryI>({
    Description: { type: String, required: true },
    Name: { type: String, required: true },
    Tag: { type: String, default: '' }, // Campo opcional, libre para el usuario
    Type: { type: String, enum: ['variable', 'fijo'], required: true },
    Icon: { type: String, default: '' }, // Campo opcional, libre para el usuario
}, {
    timestamps: false, // Adds createdAt and updatedAt fields
    validateBeforeSave: true,
    versionKey: false, // Deletes the version key (__v)\
    autoIndex: true, // Auto indexing
});


export default mongoose.model<CategoryI>('Category', CategorySchema);
