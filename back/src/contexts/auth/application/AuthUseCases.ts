import { CredentialsChecker } from './CredentialsChecker';
import { TokenService } from './TokenService';

/**
 * Aggregate of auth's application services (design D14/D16). auth has no
 * `.execute()`-style use cases like the other contexts — it owns no
 * persistence/aggregate — so this bundles the two injected services instead:
 * `credentialsChecker` for the login flow, `tokenService` for both login
 * (issuing) and the `authenticate` middleware (verifying). Wired by the
 * composition root (`container.auth`) in PR3b; the HTTP controller only
 * calls `.verify()`/`.sign()` on each service, and `_routes.ts` reads
 * `container.auth.tokenService` directly to build `createAuthenticate(...)`.
 */
export interface AuthUseCases {
    credentialsChecker: CredentialsChecker;
    tokenService: TokenService;
}
