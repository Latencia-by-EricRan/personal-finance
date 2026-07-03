import { readFileSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import type { JsonObject } from 'swagger-ui-express';

// __dirname resolves to <root>/src/config (dev) or <root>/dist/config (build);
// ../../openapi.yaml lands on the repo-root spec in both cases.
const specPath = join(__dirname, '..', '..', 'openapi.yaml');
export const openApiSpec = load(readFileSync(specPath, 'utf8')) as JsonObject;
