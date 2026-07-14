import mongoose, { Schema } from 'mongoose';
import { CategoryI } from '../../../modules/interfaces/category.interface';

// Re-exported for parity with the legacy module's document shape. PR1 is a
// pure compatibility shim: it intentionally keeps typing identical to the
// pre-migration model (`mongoose.model<CategoryI>(...)`) so every existing
// consumer (category.service.ts, report.service.ts, e2e suites) compiles
// unchanged. A domain-owned document type replaces this once PR2 introduces
// the `Category` entity, `CategoryMapper`, and decouples `report.service.ts`
// from `CategoryI` (see design D5).
export type CategoryDocument = CategoryI;

const CategorySchema: Schema = new Schema<CategoryDocument>({
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

export default mongoose.model<CategoryDocument>('Category', CategorySchema);
