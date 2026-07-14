import { Identity } from '../../../shared/domain/Identity';
import { AccountRepository, AccountView } from './ports/AccountRepository';

export class FindAccountById {
    constructor(private readonly repository: AccountRepository) {}

    async execute(id: string): Promise<AccountView | null> {
        return this.repository.findById(Identity.create(id));
    }
}
