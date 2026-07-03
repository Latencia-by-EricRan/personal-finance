import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/account.service', () => ({
    default: {
        find: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        archive: vi.fn(),
        getBalance: vi.fn(),
        transfer: vi.fn(),
    },
}));

import AccountService from '../services/account.service';
import { ServiceError } from '../../utils/service-error.util';
import {
    archiveAccount,
    createAccount,
    createTransfer,
    getAccountBalance,
    getAccountById,
    getAccounts,
    updateAccount,
} from './account.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getAccounts', () => {
    it('paginates using page/limit query params', async () => {
        vi.mocked(AccountService.find).mockResolvedValue([]);
        const req = { query: { page: '2', limit: '10' } } as unknown as Request;
        const res = mockRes();

        await getAccounts(req, res);

        expect(AccountService.find).toHaveBeenCalledWith({ Archived: false }, { limit: 10, skip: 10 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('defaults to page 1, limit 50 when no query params are given', async () => {
        vi.mocked(AccountService.find).mockResolvedValue([]);
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getAccounts(req, res);

        expect(AccountService.find).toHaveBeenCalledWith({ Archived: false }, { limit: 50, skip: 0 });
    });

    it('excludes archived accounts by default', async () => {
        vi.mocked(AccountService.find).mockResolvedValue([]);
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getAccounts(req, res);

        expect(AccountService.find).toHaveBeenCalledWith({ Archived: false }, expect.anything());
    });

    it('includes archived accounts when includeArchived=true', async () => {
        vi.mocked(AccountService.find).mockResolvedValue([]);
        const req = { query: { includeArchived: 'true' } } as unknown as Request;
        const res = mockRes();

        await getAccounts(req, res);

        expect(AccountService.find).toHaveBeenCalledWith({}, expect.anything());
    });

    it('responds with 500 on service error', async () => {
        vi.mocked(AccountService.find).mockRejectedValue(new Error('boom'));
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getAccounts(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});

describe('getAccountById', () => {
    it('responds with the account when found', async () => {
        const account = { _id: '507f1f77bcf86cd799439011', Name: 'Cash' };
        vi.mocked(AccountService.findById).mockResolvedValue(account as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getAccountById(req, res);

        expect(AccountService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith(account);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the account does not exist', async () => {
        vi.mocked(AccountService.findById).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getAccountById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });
});

describe('createAccount', () => {
    it('delegates to AccountService.create and responds 201', async () => {
        const body = { Name: 'Cash', Type: 'efectivo', Currency: 'ARS' };
        const created = { ...body, _id: '507f1f77bcf86cd799439011' };
        vi.mocked(AccountService.create).mockResolvedValue(created as never);
        const req = { body } as unknown as Request;
        const res = mockRes();

        await createAccount(req, res);

        expect(AccountService.create).toHaveBeenCalledWith(body);
        expect(res.json).toHaveBeenCalledWith(created);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('updateAccount', () => {
    it('delegates to AccountService.update and responds 200', async () => {
        const body = { Name: 'Cash renamed' };
        const updated = { ...body, _id: '507f1f77bcf86cd799439011' };
        vi.mocked(AccountService.update).mockResolvedValue(updated as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body } as unknown as Request;
        const res = mockRes();

        await updateAccount(req, res);

        expect(AccountService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', body);
        expect(res.json).toHaveBeenCalledWith(updated);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the account to update does not exist', async () => {
        vi.mocked(AccountService.update).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body: {} } as unknown as Request;
        const res = mockRes();

        await updateAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });
});

describe('archiveAccount', () => {
    it('calls AccountService.archive (not a delete method) and responds with the archived account', async () => {
        const archived = { _id: '507f1f77bcf86cd799439011', Name: 'Cash', Archived: true };
        vi.mocked(AccountService.archive).mockResolvedValue(archived as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await archiveAccount(req, res);

        expect(AccountService.archive).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith(archived);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the account to archive does not exist', async () => {
        vi.mocked(AccountService.archive).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await archiveAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });
});

describe('getAccountBalance', () => {
    it('responds with { Account, Balance } when the account exists', async () => {
        const account = { _id: '507f1f77bcf86cd799439011', Name: 'Cash' };
        vi.mocked(AccountService.findById).mockResolvedValue(account as never);
        vi.mocked(AccountService.getBalance).mockResolvedValue(750);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getAccountBalance(req, res);

        expect(AccountService.getBalance).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith({ Account: '507f1f77bcf86cd799439011', Balance: 750 });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the account does not exist, without calling getBalance', async () => {
        vi.mocked(AccountService.findById).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getAccountBalance(req, res);

        expect(AccountService.getBalance).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });
});

describe('createTransfer', () => {
    it('delegates to AccountService.transfer and responds 201 with the two created movements', async () => {
        const body = { From: '507f1f77bcf86cd799439001', To: '507f1f77bcf86cd799439002', Amount: 500, Date: '2026-01-01' };
        const movements = [
            { _id: 'mv-egreso', Type: 'egreso' },
            { _id: 'mv-ingreso', Type: 'ingreso' },
        ];
        vi.mocked(AccountService.transfer).mockResolvedValue(movements as never);
        const req = { body } as unknown as Request;
        const res = mockRes();

        await createTransfer(req, res);

        expect(AccountService.transfer).toHaveBeenCalledWith(body);
        expect(res.json).toHaveBeenCalledWith(movements);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('responds with 404 when the service throws a ServiceError for account not found', async () => {
        vi.mocked(AccountService.transfer).mockRejectedValue(new ServiceError('From account not found', 404));
        const req = { body: {} } as unknown as Request;
        const res = mockRes();

        await createTransfer(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'From account not found' });
    });

    it('responds with 400 when the service throws a ServiceError for a validation failure', async () => {
        vi.mocked(AccountService.transfer).mockRejectedValue(new ServiceError('Amount must be greater than 0', 400));
        const req = { body: {} } as unknown as Request;
        const res = mockRes();

        await createTransfer(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Amount must be greater than 0' });
    });

    it('responds with 500 when the service throws a plain (non-ServiceError) error', async () => {
        vi.mocked(AccountService.transfer).mockRejectedValue(new Error('unexpected boom'));
        const req = { body: {} } as unknown as Request;
        const res = mockRes();

        await createTransfer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'unexpected boom' });
    });
});
