import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

/**
 * Backend API base URL, resolved differently depending on which platform
 * config bundle is active:
 * - Browser + Karma (default factory): `environment.apiUrl`.
 * - Server-side rendering: overridden in `app.config.server.ts` from
 *   `process.env['API_URL_SERVER']`.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
