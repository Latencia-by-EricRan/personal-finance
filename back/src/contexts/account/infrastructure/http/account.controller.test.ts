import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceError } from '../../../../utils/service-error.util';
import { AccountUseCases } from '../../application/AccountUseCases';
import { AccountView } from '../../application/ports/AccountRepository';
import { createAccountController } from './account.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const makeUseCases = (): AccountUseCases => ({
    findAccounts: { execute: vi.fn() } as never,
    findAccountById: { execute: vi.fn() } as never,
    createAccount: { execute: vi.fn() } as never,
    updateAccount: { execute: vi.fn() } as never,
    archiveAccount: { execute: vi.fn() } as never,
    getAccountBalance: { execute: vi.fn() } as never,
    transfer: { execute: vi.fn() } as never,
});

const accountView = (overrides: Partial<AccountView> = {}): AccountView => ({
    _id: '507f1f77bcf86cd799439011',
    Name: 'Checking',
    Type: 'banco',
    Currency: 'ARS',
    Icon: '',
    Archived: false,
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createAccountController', () => {
    describe('getAccounts', () => {
        it('filters archived accounts out by default and returns 200', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findAccounts.execute).mockResolvedValue([accountView()]);
            const controller = createAccountController(useCases);
            const req = { query: {} } as unknown as Request;
            const res = mockRes();

            await controller.getAccounts(req, res);

            expect(useCases.findAccounts.execute).toHaveBeenCalledWith({ Archived: false }, { limit: 50, skip: 0 });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('includes archived accounts when includeArchived=true', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findAccounts.execute).mockResolvedValue([]);
            const controller = createAccountController(useCases);
            const req = { query: { includeArchived: 'true' } } as unknown as Request;
            const res = mockRes();

            await controller.getAccounts(req, res);

            expect(useCases.findAccounts.execute).toHaveBeenCalledWith({}, { limit: 50, skip: 0 });
        });
    });

    describe('getAccountById', () => {
        it('responds 200 with the account view when found', async () => {
            const useCases = makeUseCases();
            const view = accountView();
            vi.mocked(useCases.findAccountById.execute).mockResolvedValue(view);
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getAccountById(req, res);

            expect(useCases.findAccountById.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith(view);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Account not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findAccountById.execute).mockResolvedValue(null);
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getAccountById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
        });
    });

    describe('createAccount', () => {
        it('delegates to createAccount.execute with the raw body and responds 201 with the returned view', async () => {
            const body = { Name: 'New Account', Type: 'banco' };
            const useCases = makeUseCases();
            const created = accountView({ Name: 'New Account' });
            vi.mocked(useCases.createAccount.execute).mockResolvedValue(created);
            const controller = createAccountController(useCases);
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.createAccount(req, res);

            expect(useCases.createAccount.execute).toHaveBeenCalledWith(body);
            expect(res.json).toHaveBeenCalledWith(created);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('responds 500 when the use case throws a generic (non-ServiceError) Error, matching legacy default status', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.createAccount.execute).mockRejectedValue(new Error('Account.Name must be a non-empty string'));
            const controller = createAccountController(useCases);
            const req = { body: { Name: '', Type: 'banco' } } as unknown as Request;
            const res = mockRes();

            await controller.createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateAccount', () => {
        it('delegates to updateAccount.execute with id + the raw patch and responds 200 with the updated view', async () => {
            const body = { Icon: '💰' };
            const useCases = makeUseCases();
            const updated = accountView({ Icon: '💰' });
            vi.mocked(useCases.updateAccount.execute).mockResolvedValue(updated);
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' }, body } as unknown as Request;
            const res = mockRes();

            await controller.updateAccount(req, res);

            expect(useCases.updateAccount.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011', body);
            expect(res.json).toHaveBeenCalledWith(updated);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Account not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.updateAccount.execute).mockResolvedValue(null);
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' }, body: {} } as unknown as Request;
            const res = mockRes();

            await controller.updateAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
        });
    });

    describe('archiveAccount', () => {
        it('delegates to archiveAccount.execute and responds 200 with the archived view', async () => {
            const useCases = makeUseCases();
            const archived = accountView({ Archived: true });
            vi.mocked(useCases.archiveAccount.execute).mockResolvedValue(archived);
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.archiveAccount(req, res);

            expect(useCases.archiveAccount.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith(archived);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Account not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.archiveAccount.execute).mockResolvedValue(null);
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.archiveAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
        });
    });

    describe('getAccountBalance', () => {
        it('responds 200 with { Account, Balance } on success', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.getAccountBalance.execute).mockResolvedValue({
                Account: '507f1f77bcf86cd799439011',
                Balance: 60,
            });
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getAccountBalance(req, res);

            expect(useCases.getAccountBalance.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith({ Account: '507f1f77bcf86cd799439011', Balance: 60 });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('maps a ServiceError to its statusCode (404 Account not found)', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.getAccountBalance.execute).mockRejectedValue(new ServiceError('Account not found', 404));
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getAccountBalance(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
        });

        it('maps a non-ServiceError to 500', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.getAccountBalance.execute).mockRejectedValue(new Error('boom'));
            const controller = createAccountController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getAccountBalance(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('createTransfer', () => {
        it('delegates to transfer.execute with the raw body and responds 201 with [egreso, ingreso]', async () => {
            const body = { From: '507f1f77bcf86cd799439011', To: '507f1f77bcf86cd799439022', Amount: 100, Date: new Date(2020, 0, 1) };
            const useCases = makeUseCases();
            const movements = [{ _id: 'e1', Type: 'egreso' }, { _id: 'i1', Type: 'ingreso' }];
            vi.mocked(useCases.transfer.execute).mockResolvedValue(movements as never);
            const controller = createAccountController(useCases);
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.createTransfer(req, res);

            expect(useCases.transfer.execute).toHaveBeenCalledWith(body);
            expect(res.json).toHaveBeenCalledWith(movements);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('maps a ServiceError to its statusCode (400 From and To must be different)', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.transfer.execute).mockRejectedValue(
                new ServiceError('From and To accounts must be different', 400),
            );
            const controller = createAccountController(useCases);
            const req = { body: {} } as unknown as Request;
            const res = mockRes();

            await controller.createTransfer(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'From and To accounts must be different' });
        });

        it('maps a non-ServiceError to 500', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.transfer.execute).mockRejectedValue(new Error('unexpected'));
            const controller = createAccountController(useCases);
            const req = { body: {} } as unknown as Request;
            const res = mockRes();

            await controller.createTransfer(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
