import jwt from 'jsonwebtoken';
import { TokenConfig } from './ports/AuthConfig';

/**
 * Splits legacy `AuthService.signToken`/`verifyToken` out of `CredentialsChecker`
 * (design D14): the `authenticate` middleware only ever needs token
 * verification, so it can depend on `TokenService` alone once wired (PR3b).
 * `sign()` takes the subject explicitly rather than baking it into
 * `TokenConfig`, since `TokenConfig` carries only token-issuance policy
 * (`secret`, `expiresIn`), not credential identity.
 */
export class TokenService {
    constructor(private readonly config: TokenConfig) {}

    /**
     * Exposes the configured `expiresIn` policy value (e.g. `'1d'`) so the
     * login controller can echo it in the response body, same as the legacy
     * controller reading `authConfig.jwtExpiresIn` directly (PR3b).
     */
    get expiresIn(): string {
        return this.config.expiresIn;
    }

    sign(subject: string): string {
        return jwt.sign({ sub: subject }, this.config.secret, {
            expiresIn: this.config.expiresIn as jwt.SignOptions['expiresIn'],
        });
    }

    verify(token: string): jwt.JwtPayload | string {
        return jwt.verify(token, this.config.secret);
    }
}
