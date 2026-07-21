import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../../../middlewares/response.middleware';
import { toMessage } from '../../../../utils/controller.util';
import { AuthUseCases } from '../../application/AuthUseCases';

/**
 * Inbound HTTP adapter (design D14/D16). Factory over `AuthUseCases` — no
 * static `getContainer()` import here, so this controller can be
 * unit-tested with plain mock services (mock-layer-below convention).
 * Mirrors `createReportController`/`createRecurringController`'s shape.
 *
 * Byte-identical response shapes/status codes to the legacy
 * `modules/controllers/auth.controller.ts`: 200 `{token, expiresIn}` on
 * success, 401 `{message: 'Invalid credentials'}` on bad credentials, 500 on
 * unexpected errors. `tokenService.sign(Email)` replaces the legacy
 * `AuthService.signToken()` (which signed the module-level
 * `authConfig.authEmail`) — equivalent because `credentialsChecker.verify`
 * only resolves true when `Email` already matches the configured email.
 *
 * DEVIATION (justified, non-behavioral): reads `req.body` directly instead
 * of the legacy `matchedData(req)`. `loginValidator`'s chain has zero
 * sanitizers (`isEmail`/`isString().notEmpty()` only, no `.trim()`/
 * `.normalizeEmail()`), so `matchedData` post-validation and `req.body` are
 * always identical values here — `req.body` is simply unit-testable without
 * first replaying the validator, matching `recurring`/`budget`'s create
 * controllers' convention.
 */
export const createAuthController = (useCases: AuthUseCases) => {
    const login = async (req: Request, res: Response) => {
        try {
            const { Email, Password } = req.body as { Email: string; Password: string };
            const valid = await useCases.credentialsChecker.verify(Email, Password);
            if (!valid) {
                errorResponse(res, 'Invalid credentials', 401);
                return;
            }
            const token = useCases.tokenService.sign(Email);
            successResponse(res, { token, expiresIn: useCases.tokenService.expiresIn });
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    return { login };
};
