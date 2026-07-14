import { Movement, MovementProps } from '../domain/Movement';
import { MovementRepository, MovementView } from './ports/MovementRepository';

export class SaveManyMovements {
    constructor(private readonly repository: MovementRepository) {}

    async execute(inputs: MovementProps[]): Promise<MovementView[]> {
        const movements = inputs.map((input) => Movement.create(input));

        return this.repository.saveMany(movements);
    }
}
