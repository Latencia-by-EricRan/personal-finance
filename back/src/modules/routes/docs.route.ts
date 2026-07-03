import { Router, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../../config/openapi';

const docsRoute = Router();

// Overwrites the global helmet CSP header for /docs ONLY (Swagger UI needs inline script/style).
docsRoute.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
        },
    }),
);

docsRoute.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(openApiSpec);
});

docsRoute.use('/', swaggerUi.serve);
docsRoute.get('/', swaggerUi.setup(openApiSpec));

export default docsRoute;
