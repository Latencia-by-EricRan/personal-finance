import { Movement, MovementProps } from '../domain/Movement';
import { MovementRepository, MovementView } from './ports/MovementRepository';

export class CreateMovement {
    constructor(private readonly repository: MovementRepository) {}

    async execute(props: MovementProps): Promise<MovementView> {
        const movement = Movement.create(props);

        return this.repository.create(movement);
    }
}
