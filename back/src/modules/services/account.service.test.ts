import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../models/Account.model', () => ({
    default: {
        find: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

vi.mock('../models/Movement.model', () => ({
    default: {
        find: vi.fn(),
        create: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
}));

import AccountModel from '../models/Account.model';
import MovementModel from '../models/Movement.model';
import AccountService from './account.service';
import { ServiceError } from '../../utils/service-error.util';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('AccountService.find', () => {
    it('applies pagination skip/limit when provided', async () => {
        const query = { skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() };
        vi.mocked(AccountModel.find).mockReturnValue(query as never);

        await AccountService.find({}, { limit: 10, skip: 20 });

        expect(AccountModel.find).toHaveBeenCalledWith({});
        expect(query.skip).toHaveBeenCalledWith(20);
        expect(query.limit).toHaveBeenCalledWith(10);
    });

    it('does not paginate when no pagination is provided', async () => {
        const query = { skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() };
        vi.mocked(AccountModel.find).mockReturnValue(query as never);

        await AccountService.find({});

        expect(query.skip).not.toHaveBeenCalled();
        expect(query.limit).not.toHaveBeenCalled();
    });
});

describe('AccountService.findById', () => {
    it('delegates to AccountModel.findById', async () => {
        const account = { _id: '507f1f77bcf86cd799439011', Name: 'Cash' };
        vi.mocked(AccountModel.findById).mockResolvedValue(account as never);

        const result = await AccountService.findById('507f1f77bcf86cd799439011');

        expect(AccountModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(result).toBe(account);
    });
});

describe('AccountService.create', () => {
    it('delegates to AccountModel.create', async () => {
        const data = { Name: 'Cash', Type: 'efectivo' as const, Currency: 'ARS', Archived: false };
        vi.mocked(AccountModel.create).mockResolvedValue(data as never);

        const result = await AccountService.create(data);

        expect(AccountModel.create).toHaveBeenCalledWith(data);
        expect(result).toBe(data);
    });
});

describe('AccountService.update', () => {
    it('runs findByIdAndUpdate with validators and returns the new document', async () => {
        const data = { Name: 'Cash renamed', Type: 'efectivo' as const, Currency: 'ARS', Archived: false };
        vi.mocked(AccountModel.findByIdAndUpdate).mockResolvedValue(data as never);

        const result = await AccountService.update('507f1f77bcf86cd799439011', data);

        expect(AccountModel.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            data,
            { new: true, runValidators: true },
        );
        expect(result).toBe(data);
    });
});

describe('AccountService.archive', () => {
    it('sets Archived to true via findByIdAndUpdate', async () => {
        const archived = { Name: 'Cash', Type: 'efectivo' as const, Currency: 'ARS', Archived: true };
        vi.mocked(AccountModel.findByIdAndUpdate).mockResolvedValue(archived as never);

        const result = await AccountService.archive('507f1f77bcf86cd799439011');

        expect(AccountModel.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            { Archived: true },
            { new: true },
        );
        expect(result).toBe(archived);
    });
});

describe('AccountService.getBalance', () => {
    it('sums ingreso minus egreso movements for the account', async () => {
        vi.mocked(MovementModel.find).mockResolvedValue([
            { Type: 'ingreso', Amount: 1000 },
            { Type: 'egreso', Amount: 300 },
            { Type: 'ingreso', Amount: 50 },
        ] as never);

        const result = await AccountService.getBalance('507f1f77bcf86cd799439011');

        expect(MovementModel.find).toHaveBeenCalledWith({ Account: '507f1f77bcf86cd799439011' });
        expect(result).toBe(750);
    });

    it('returns 0 when the account has no movements', async () => {
        vi.mocked(MovementModel.find).mockResolvedValue([] as never);

        const result = await AccountService.getBalance('507f1f77bcf86cd799439011');

        expect(result).toBe(0);
    });
});

describe('AccountService.transfer', () => {
    const From = '507f1f77bcf86cd799439001';
    const To = '507f1f77bcf86cd799439002';
    const baseInput = { From, To, Amount: 500, Date: new Date('2026-01-01') };

    it('creates two linked movements (egreso on From, ingreso on To) sharing a TransferId', async () => {
        vi.mocked(AccountModel.findById).mockImplementation((id: unknown) =>
            Promise.resolve({ _id: id, Archived: false }) as never);

        const egresoMovement = { _id: 'mv-egreso', Type: 'egreso', Account: From, Amount: 500 };
        const ingresoMovement = { _id: 'mv-ingreso', Type: 'ingreso', Account: To, Amount: 500 };
        vi.mocked(MovementModel.create)
            .mockResolvedValueOnce(egresoMovement as never)
            .mockResolvedValueOnce(ingresoMovement as never);

        const result = await AccountService.transfer(baseInput);

        expect(MovementModel.create).toHaveBeenCalledTimes(2);
        const [firstCallArg] = vi.mocked(MovementModel.create).mock.calls[0];
        const [secondCallArg] = vi.mocked(MovementModel.create).mock.calls[1];
        expect((firstCallArg as { Type: string; Account: string }).Type).toBe('egreso');
        expect((firstCallArg as { Account: string }).Account).toBe(From);
        expect((secondCallArg as { Type: string; Account: string }).Type).toBe('ingreso');
        expect((secondCallArg as { Account: string }).Account).toBe(To);

        const firstTransferId = (firstCallArg as { TransferId: string }).TransferId;
        const secondTransferId = (secondCallArg as { TransferId: string }).TransferId;
        expect(firstTransferId).toBeTruthy();
        expect(firstTransferId).toBe(secondTransferId);

        expect(result).toEqual([egresoMovement, ingresoMovement]);
    });

    it('rejects with a 400 ServiceError when From === To', async () => {
        const error = await AccountService.transfer({ ...baseInput, To: From }).catch(e => e);
        expect(error).toBeInstanceOf(ServiceError);
        expect((error as ServiceError).statusCode).toBe(400);
        expect(MovementModel.create).not.toHaveBeenCalled();
    });

    it('rejects with a 400 ServiceError when Amount is not positive', async () => {
        const zeroError = await AccountService.transfer({ ...baseInput, Amount: 0 }).catch(e => e);
        expect(zeroError).toBeInstanceOf(ServiceError);
        expect((zeroError as ServiceError).statusCode).toBe(400);

        const negativeError = await AccountService.transfer({ ...baseInput, Amount: -10 }).catch(e => e);
        expect(negativeError).toBeInstanceOf(ServiceError);
        expect((negativeError as ServiceError).statusCode).toBe(400);
        expect(MovementModel.create).not.toHaveBeenCalled();
    });

    it('rejects with a 404 ServiceError when the From account does not exist', async () => {
        vi.mocked(AccountModel.findById).mockImplementation((id: unknown) =>
            Promise.resolve(id === From ? null : { _id: id }) as never);

        const error = await AccountService.transfer(baseInput).catch(e => e);
        expect(error).toBeInstanceOf(ServiceError);
        expect((error as ServiceError).statusCode).toBe(404);
        expect(MovementModel.create).not.toHaveBeenCalled();
    });

    it('rejects with a 404 ServiceError when the To account does not exist', async () => {
        vi.mocked(AccountModel.findById).mockImplementation((id: unknown) =>
            Promise.resolve(id === To ? null : { _id: id }) as never);

        const error = await AccountService.transfer(baseInput).catch(e => e);
        expect(error).toBeInstanceOf(ServiceError);
        expect((error as ServiceError).statusCode).toBe(404);
        expect(MovementModel.create).not.toHaveBeenCalled();
    });

    it('rejects with a 400 ServiceError when the From account is archived', async () => {
        vi.mocked(AccountModel.findById).mockImplementation((id: unknown) =>
            Promise.resolve({ _id: id, Archived: id === From }) as never);

        const error = await AccountService.transfer(baseInput).catch(e => e);
        expect(error).toBeInstanceOf(ServiceError);
        expect((error as ServiceError).statusCode).toBe(400);
        expect(MovementModel.create).not.toHaveBeenCalled();
    });

    it('rejects with a 400 ServiceError when the To account is archived', async () => {
        vi.mocked(AccountModel.findById).mockImplementation((id: unknown) =>
            Promise.resolve({ _id: id, Archived: id === To }) as never);

        const error = await AccountService.transfer(baseInput).catch(e => e);
        expect(error).toBeInstanceOf(ServiceError);
        expect((error as ServiceError).statusCode).toBe(400);
        expect(MovementModel.create).not.toHaveBeenCalled();
    });

    it('rolls back (deletes) the first movement when creating the second one fails', async () => {
        vi.mocked(AccountModel.findById).mockImplementation((id: unknown) =>
            Promise.resolve({ _id: id, Archived: false }) as never);

        const egresoMovement = { _id: 'mv-egreso', Type: 'egreso', Account: From, Amount: 500 };
        vi.mocked(MovementModel.create)
            .mockResolvedValueOnce(egresoMovement as never)
            .mockRejectedValueOnce(new Error('ingreso creation failed'));
        vi.mocked(MovementModel.findByIdAndDelete).mockResolvedValue(egresoMovement as never);

        await expect(AccountService.transfer(baseInput)).rejects.toThrow('ingreso creation failed');

        expect(MovementModel.create).toHaveBeenCalledTimes(2);
        expect(MovementModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
        expect(MovementModel.findByIdAndDelete).toHaveBeenCalledWith('mv-egreso');
    });

    it('logs and re-throws the ORIGINAL error (not the rollback error) when the compensating delete also fails', async () => {
        vi.mocked(AccountModel.findById).mockImplementation((id: unknown) =>
            Promise.resolve({ _id: id, Archived: false }) as never);

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const egresoMovement = { _id: 'mv-egreso', Type: 'egreso', Account: From, Amount: 500 };
        const originalError = new Error('ingreso creation failed');
        vi.mocked(MovementModel.create)
            .mockResolvedValueOnce(egresoMovement as never)
            .mockRejectedValueOnce(originalError);
        vi.mocked(MovementModel.findByIdAndDelete).mockRejectedValue(new Error('rollback delete failed'));

        const error = await AccountService.transfer(baseInput).catch(e => e);

        expect(error).toBe(originalError);
        expect(consoleErrorSpy).toHaveBeenCalled();
        const loggedArgs = consoleErrorSpy.mock.calls[0].map(arg => String(arg)).join(' ');
        expect(loggedArgs).toContain('mv-egreso');

        consoleErrorSpy.mockRestore();
    });
});
