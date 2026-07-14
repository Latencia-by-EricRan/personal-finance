import { Identity } from '../../../shared/domain/Identity';
import { MovementPatch, MovementRepository, MovementView } from './ports/MovementRepository';

export class UpdateMovement {
    constructor(private readonly repository: MovementRepository) {}

    async execute(id: string, patch: MovementPatch): Promise<MovementView | null> {
        return this.repository.update(Identity.create(id), patch);
    }
}
