import { Identity } from '../../../shared/domain/Identity';
import { ExampleItem } from '../domain/ExampleItem';
import { ExampleItemRepository } from './ports/ExampleItemRepository';

export interface RegisterExampleItemInput {
    id: string;
    name: string;
    quantity: number;
}

export class RegisterExampleItem {
    constructor(private readonly repository: ExampleItemRepository) {}

    async execute(input: RegisterExampleItemInput): Promise<ExampleItem> {
        const item = ExampleItem.create(Identity.create(input.id), input.name, input.quantity);

        await this.repository.save(item);

        return item;
    }
}
