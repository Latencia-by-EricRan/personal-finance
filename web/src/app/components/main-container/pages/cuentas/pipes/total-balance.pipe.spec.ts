import { TotalBalancePipe } from './total-balance.pipe';
import { AccountType, IAccount } from '../../../../../core/reference';

describe('TotalBalancePipe', () => {
  let pipe: TotalBalancePipe;

  const accounts: IAccount[] = [
    { _id: 'acc-1', Name: 'Efectivo', Type: AccountType.EFECTIVO, Currency: 'ARS' },
    { _id: 'acc-2', Name: 'Banco', Type: AccountType.BANCO, Currency: 'ARS' },
  ];

  beforeEach(() => {
    pipe = new TotalBalancePipe();
  });

  it('returns 0 when there are no accounts', () => {
    expect(pipe.transform([], {})).toBe(0);
  });

  it('sums the balances of every account once all have loaded', () => {
    expect(pipe.transform(accounts, { 'acc-1': 1000, 'acc-2': 2500 })).toBe(3500);
  });

  it('sums correctly when a balance is negative', () => {
    expect(pipe.transform(accounts, { 'acc-1': 1000, 'acc-2': -410 })).toBe(590);
  });

  it('returns null while any account balance has not loaded yet', () => {
    expect(pipe.transform(accounts, { 'acc-1': 1000 })).toBeNull();
  });

  it('returns null when an account has no _id', () => {
    expect(pipe.transform([{ Name: 'X', Type: AccountType.EFECTIVO, Currency: 'ARS' }], {})).toBeNull();
  });
});
