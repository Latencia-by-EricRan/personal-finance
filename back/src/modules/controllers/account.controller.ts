import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../utils/controller.util';
import AccountService from '../services/account.service';
import { ServiceError } from '../../utils/service-error.util';

const getAccounts = async (req: Request, res: Response) => {
    try {
        const filter = req.query.includeArchived === 'true' ? {} : { Archived: false };
        const accounts = await AccountService.find(filter, toPagination(req.query));
        successResponse(res, accounts);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getAccountById = async (req: Request, res: Response) => {
    try {
        const account = await AccountService.findById(req.params.id);
        if (!account) {
            errorResponse(res, 'Account not found', 404);
            return;
        }
        successResponse(res, account);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const createAccount = async (req: Request, res: Response) => {
    try {
        const account = await AccountService.create(req.body);
        successResponse(res, account, 201);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const updateAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const account = await AccountService.update(id, req.body);
        if (!account) {
            errorResponse(res, 'Account not found', 404);
            return;
        }
        successResponse(res, account);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const archiveAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const account = await AccountService.archive(id);
        if (!account) {
            errorResponse(res, 'Account not found', 404);
            return;
        }
        successResponse(res, account);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getAccountBalance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const account = await AccountService.findById(id);
        if (!account) {
            errorResponse(res, 'Account not found', 404);
            return;
        }
        const Balance = await AccountService.getBalance(id);
        successResponse(res, { Account: id, Balance });
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const createTransfer = async (req: Request, res: Response) => {
    try {
        const movements = await AccountService.transfer(req.body);
        successResponse(res, movements, 201);
    } catch (error: unknown) {
        const statusCode = error instanceof ServiceError ? error.statusCode : 500;
        errorResponse(res, toMessage(error), statusCode);
    }
};


export {
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    archiveAccount,
    getAccountBalance,
    createTransfer,
}
