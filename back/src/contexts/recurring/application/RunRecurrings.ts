import { RecurringRepository } from './ports/RecurringRepository';
import { CreatedMovementView, MovementGateway } from './ports/MovementGateway';

/**
 * Byte-identical port of `RecurringService.run` (legacy
 * `src/modules/services/recurring.service.ts`) onto `RecurringRepository` +
 * `MovementGateway` (design D12). The atomic optimistic idempotency claim
 * (`repository.claim`), `DayOfMonth` clamp to days-in-month, and
 * per-item continue-on-failure are all replicated verbatim; only Movement
 * persistence crosses into the `MovementGateway` seam.
 */
export class RunRecurrings {
    constructor(
        private readonly repository: RecurringRepository,
        private readonly movementGateway: MovementGateway,
    ) {}

    async execute(): Promise<CreatedMovementView[]> {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-indexed current month
        const currentYearMonth = `${year}-${String(month).padStart(2, '0')}`;

        const dueRecurrings = await this.repository.findDue(currentYearMonth);
        const createdMovements: CreatedMovementView[] = [];

        for (const recurring of dueRecurrings) {
            if (!recurring.Account) {
                continue;
            }

            const claimed = await this.repository.claim(recurring._id, currentYearMonth);

            if (!claimed) {
                continue;
            }

            try {
                const daysInMonth = new Date(year, month, 0).getDate();
                const clampedDay = Math.min(recurring.DayOfMonth, daysInMonth);
                const targetDate = new Date(year, month - 1, clampedDay);

                const movement = await this.movementGateway.createMovement({
                    Type: recurring.Type,
                    Amount: recurring.Amount,
                    Category: recurring.Category,
                    Account: recurring.Account,
                    Description: recurring.Description,
                    Card: recurring.Card,
                    Date: targetDate,
                });

                createdMovements.push(movement);
            } catch (error: unknown) {
                console.error(`RunRecurrings: failed to create Movement for recurring ${recurring._id}`, error);
                continue;
            }
        }

        return createdMovements;
    }
}
