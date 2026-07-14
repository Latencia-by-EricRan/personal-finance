import { Identity } from '../../../shared/domain/Identity';
import { Movement } from '../domain/Movement';
import { MovementPatch, MovementRepository, MovementView, Pagination } from '../application/ports/MovementRepository';

export class InMemoryMovementRepository implements MovementRepository {
    private readonly movements = new Map<string, Movement>();

    async find(filter: Record<string, unknown>, _select?: string, pagination?: Pagination): Promise<MovementView[]> {
        let items = Array.from(this.movements.values()).filter((movement) => this.matchesFilter(movement, filter));

        if (pagination) {
            items = items.slice(pagination.skip, pagination.skip + pagination.limit);
        }

        return items.map((movement) => this.toView(movement));
    }

    async create(movement: Movement): Promise<MovementView> {
        const saved = this.rehydrateWithId(Identity.create(Identity.generate()), movement);
        this.movements.set(saved.id!.value, saved);

        return this.toView(saved);
    }

    async update(id: Identity, patch: MovementPatch): Promise<MovementView | null> {
        const existing = this.movements.get(id.value);

        if (!existing) {
            return null;
        }

        const merged = Movement.rehydrate(id, {
            Type: patch.Type ?? existing.type,
            Amount: patch.Amount ?? existing.amount,
            Date: patch.Date ?? existing.date,
            Account: patch.Account ?? existing.account,
            Category: 'Category' in patch ? patch.Category : existing.category,
            Description: patch.Description ?? existing.description,
            Card: patch.Card ?? existing.card,
        });

        this.movements.set(id.value, merged);

        return this.toView(merged);
    }

    async remove(id: Identity): Promise<MovementView | null> {
        const existing = this.movements.get(id.value) ?? null;

        if (existing) {
            this.movements.delete(id.value);
        }

        return existing ? this.toView(existing) : null;
    }

    async saveMany(movements: Movement[]): Promise<MovementView[]> {
        const views: MovementView[] = [];

        for (const movement of movements) {
            views.push(await this.create(movement));
        }

        return views;
    }

    private rehydrateWithId(id: Identity, movement: Movement): Movement {
        return Movement.rehydrate(id, {
            Type: movement.type,
            Amount: movement.amount,
            Date: movement.date,
            Account: movement.account,
            Category: movement.category,
            Description: movement.description,
            Card: movement.card,
        });
    }

    private toView(movement: Movement): MovementView {
        return {
            _id: movement.id!.value,
            Type: movement.type,
            Amount: movement.amount,
            Date: movement.date,
            Category: movement.category,
            Account: movement.account,
            Description: movement.description,
            Card: movement.card,
        };
    }

    private matchesFilter(movement: Movement, filter: Record<string, unknown>): boolean {
        return Object.entries(filter).every(([field, value]) => {
            if (field === 'Date' && value && typeof value === 'object') {
                const range = value as { $gte?: Date; $lte?: Date };
                const date = movement.date;

                if (range.$gte && date < range.$gte) {
                    return false;
                }
                if (range.$lte && date > range.$lte) {
                    return false;
                }

                return true;
            }

            switch (field) {
                case 'Type':
                    return movement.type === value;
                case 'Amount':
                    return movement.amount === value;
                case 'Account':
                    return movement.account === value;
                case 'Category':
                    return movement.category === value;
                case 'Description':
                    return movement.description === value;
                case 'Card':
                    return movement.card === value;
                default:
                    return true;
            }
        });
    }
}
