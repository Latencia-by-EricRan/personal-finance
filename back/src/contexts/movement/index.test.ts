import { describe, expect, it } from 'vitest';
import { MovementModel, MovementType } from './index';

describe('contexts/movement barrel', () => {
    it('re-exports the sole registered "Movement" Mongoose model', () => {
        expect(MovementModel.modelName).toBe('Movement');
        expect(MovementModel.collection.collectionName).toBe('movements');
    });

    it('re-exports the MovementType enum as a runtime value', () => {
        expect(MovementType.INGRESO).toBe('ingreso');
        expect(MovementType.EGRESO).toBe('egreso');
    });
});
