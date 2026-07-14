import { Account, AccountProps } from '../domain/Account';
import { AccountRepository, AccountView } from './ports/AccountRepository';

export class CreateAccount {
    constructor(private readonly repository: AccountRepository) {}

    async execute(props: AccountProps): Promise<AccountView> {
        const account = Account.create(props);

        return this.repository.create(account);
    }
}
