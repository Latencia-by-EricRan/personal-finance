import bcrypt from 'bcryptjs';
import { CredentialsConfig } from './ports/AuthConfig';

/**
 * Verbatim port of legacy `AuthService.verifyCredentials` (design D14),
 * parametrized by an injected `CredentialsConfig` instead of the module-level
 * `authConfig` singleton. auth owns no persistence — the config seam IS the
 * dependency, in lieu of a repository port.
 */
export class CredentialsChecker {
    constructor(private readonly config: CredentialsConfig) {}

    async verify(email: string, password: string): Promise<boolean> {
        if (email !== this.config.email) return false;
        return bcrypt.compare(password, this.config.passwordHash);
    }
}
