import { Identity } from '../../../shared/domain/Identity';

export class ExampleItem {
    private constructor(
        private readonly _id: Identity,
        private readonly _name: string,
        private readonly _quantity: number,
    ) {}

    static create(id: Identity, name: string, quantity: number): ExampleItem {
        return new ExampleItem(id, name, quantity);
    }

    get id(): Identity {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get quantity(): number {
        return this._quantity;
    }

    equals(other: ExampleItem): boolean {
        return (
            other instanceof ExampleItem &&
            this._id.equals(other._id) &&
            this._name === other._name &&
            this._quantity === other._quantity
        );
    }
}
