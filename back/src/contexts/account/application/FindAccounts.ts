import { AccountRepository, AccountView, Pagination } from './ports/AccountRepository';

export class FindAccounts {
    constructor(private readonly repository: AccountRepository) {}

    async execute(filter: Record<string, unknown>, pagination?: Pagination): Promise<AccountView[]> {
        return this.repository.find(filter, pagination);
    }
}
