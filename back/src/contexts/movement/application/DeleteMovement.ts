import { Identity } from '../../../shared/domain/Identity';
import { MovementRepository, MovementView } from './ports/MovementRepository';

export class DeleteMovement {
    constructor(private readonly repository: MovementRepository) {}

    async execute(id: string): Promise<MovementView | null> {
        return this.repository.remove(Identity.create(id));
    }
}
