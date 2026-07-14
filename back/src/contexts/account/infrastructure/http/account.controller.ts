import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../../../utils/controller.util';
import { ServiceError } from '../../../../utils/service-error.util';
import { AccountProps } from '../../domain/Account';
import { AccountPatch } from '../../application/ports/AccountRepository';
import { AccountUseCases } from '../../application/AccountUseCases';
import { TransferInput } from '../../application/Transfer';

/**
 * Inbound HTTP adapter (design D1). Factory over `AccountUseCases` — no
 * static import of `getContainer()` here, so this controller can be
 * unit-tested with plain mock use cases (mock-layer-below convention).
 * Mirrors `createMovementController`/`createCategoryController`'s shape.
 *
 * Error-status mapping (PR3 deviation note, per apply-progress obs #245's
 * carried-forward risk): `getAccounts`/`getAccountById`/`createAccount`/
 * `updateAccount`/`archiveAccount` use the SAME plain `errorResponse(res,
 * toMessage(error))` (implicit 500) the legacy controller used for their
 * equivalent unexpected-error paths — legacy never special-cased
 * `ServiceError` there either, since `AccountService`'s CRUD methods never
 * threw it (the HTTP validator, wired below, guards enum/required-field
 * shape upstream; a generic `Error` surfacing from `Account.create`/
 * `assertInvariants` in some unreachable edge case therefore maps to 500,
 * byte-identical to legacy behavior). `getAccountBalance` and
 * `createTransfer` are the two paths whose use cases legitimately throw
 * `ServiceError` (404/400) — those two handlers map
 * `error instanceof ServiceError ? error.statusCode : 500`, reproducing the
 * exact HTTP status legacy produced (via its own `ServiceError`-throwing
 * `AccountService.transfer`, and via `getAccountBalance`'s now-relocated
 * existence check) while the underlying implementation moved into the use
 * case layer.
 *
 * If a CRUD use case (`findAccounts`/`findAccountById`/`createAccount`/
 * `updateAccount`/`archiveAccount`) is ever changed to throw `ServiceError`
 * for a non-500 case, its handler needs the same `instanceof` mapping added
 * — do not "fix" this asymmetry into uniform 500-only handling without
 * checking the use case first.
 */
export const createAccountController = (useCases: AccountUseCases) => {
    const getAccounts = async (req: Request, res: Response) => {
        try {
            const filter = req.query.includeArchived === 'true' ? {} : { Archived: false };
            const accounts = await useCases.findAccounts.execute(filter, toPagination(req.query));
            successResponse(res, accounts);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getAccountById = async (req: Request, res: Response) => {
        try {
            const account = await useCases.findAccountById.execute(req.params.id);
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
            const account = await useCases.createAccount.execute(req.body as AccountProps);
            successResponse(res, account, 201);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const updateAccount = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const account = await useCases.updateAccount.execute(id, req.body as AccountPatch);
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
            const account = await useCases.archiveAccount.execute(id);
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
            const balance = await useCases.getAccountBalance.execute(id);
            successResponse(res, balance);
        } catch (error: unknown) {
            const statusCode = error instanceof ServiceError ? error.statusCode : 500;
            errorResponse(res, toMessage(error), statusCode);
        }
    };

    const createTransfer = async (req: Request, res: Response) => {
        try {
            const movements = await useCases.transfer.execute(req.body as TransferInput);
            successResponse(res, movements, 201);
        } catch (error: unknown) {
            const statusCode = error instanceof ServiceError ? error.statusCode : 500;
            errorResponse(res, toMessage(error), statusCode);
        }
    };

    return {
        getAccounts,
        getAccountById,
        createAccount,
        updateAccount,
        archiveAccount,
        getAccountBalance,
        createTransfer,
    };
};
