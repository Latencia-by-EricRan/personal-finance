import { AccountTypeLabelPipe } from './account-type-label.pipe';
import { AccountType } from '../../../../../core/reference';

describe('AccountTypeLabelPipe', () => {
  let pipe: AccountTypeLabelPipe;

  beforeEach(() => {
    pipe = new AccountTypeLabelPipe();
  });

  it('translates efectivo to Cash', () => {
    expect(pipe.transform(AccountType.EFECTIVO)).toBe('Cash');
  });

  it('translates banco to Bank', () => {
    expect(pipe.transform(AccountType.BANCO)).toBe('Bank');
  });

  it('translates tarjeta to Credit card', () => {
    expect(pipe.transform(AccountType.TARJETA)).toBe('Credit card');
  });
});
