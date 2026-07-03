import { Router } from 'express';
import {
    archiveAccount,
    createAccount,
    createTransfer,
    getAccountBalance,
    getAccountById,
    getAccounts,
    updateAccount,
} from '../controllers/account.controller';
import { bodyValidator, idValidator, transferValidator } from '../validators/account.validator';

const router = Router();

/**
 * start path: /account
 * */

router.get('/',               getAccounts);
router.post('/transfer',      transferValidator,    createTransfer);
router.get('/:id/balance',    idValidator,          getAccountBalance);
router.get('/:id',    idValidator,           getAccountById);
router.post('/',      bodyValidator,         createAccount);
router.put('/:id',    idValidator, bodyValidator, updateAccount);
router.delete('/:id', idValidator,           archiveAccount);

export default router;
