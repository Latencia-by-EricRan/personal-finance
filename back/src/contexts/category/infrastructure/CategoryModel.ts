import mongoose, { Schema } from 'mongoose';

// Domain-owned document type (PR2): structurally identical to the legacy
// `CategoryI` (`modules/interfaces/category.interface.ts`) that PR1's shim
// aliased directly, but no longer imports it. `category.service.ts`,
// `category.controller.ts`, etc. still compile unchanged against this model
// because the shape (field names/optionality) is preserved byte-for-byte —
// only the import path changed. This closes the PR1 note: with no remaining
// dependency from `contexts/category` onto `modules/interfaces/category.interface.ts`,
// that legacy interface becomes fully deletable once PR3 removes the
// layer-first `category` module.
export interface CategoryDocument {
    Description: string;
    Name: string;
    Tag: string;
    Type: 'variable' | 'fijo';
    Icon?: string;
    _id?: Schema.Types.ObjectId;
}

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
