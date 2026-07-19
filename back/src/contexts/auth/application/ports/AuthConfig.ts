/**
 * auth-local application ports (design D14): auth owns no persistence, so
 * these are plain injected value shapes, not repository ports. `CredentialsChecker`
 * depends on `CredentialsConfig`; `TokenService` depends on `TokenConfig`. Both
 * are produced by `infrastructure/authConfig.ts` from env vars (relocated,
 * unchanged seam from legacy `config/auth.config.ts`).
 */
export interface CredentialsConfig {
    email: string;
    passwordHash: string;
}

export interface TokenConfig {
    secret: string;
    expiresIn: string;
}
