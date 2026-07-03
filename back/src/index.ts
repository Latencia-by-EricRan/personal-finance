import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mainRoutes from './_routes';
import MongoDB from './config/database';
import { errorResponse } from './middlewares/response.middleware';

// Inicialización de la aplicación
const app = express();

// Cabeceras de seguridad HTTP
app.use(helmet());

// Política de CORS (orígenes permitidos configurables por entorno)
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

app.use(
    cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : false,
        credentials: true,
    }),
);

// Límite de tamaño del cuerpo de la petición (evita OOM por payloads grandes)
app.use(express.json({ limit: '100kb' }));

// Límite de tasa de peticiones (mitiga abuso y fuerza bruta)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máx. peticiones por IP en la ventana
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Middleware para parsear todas las rutas
app.use('/', mainRoutes);

// Global error handler — must be registered after all routes
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    errorResponse(res, err.message || 'Internal server error');
});

// Puerto de la aplicación
const port = process.env.PORT ?? 80;


MongoDB()
    .then((message) => {
        app.listen(port, () => {
            console.info(message, `\n[Server] Running at http://localhost:${port}`);
        });
    })
    .catch(() => {
        console.error('[Server] Database connection failed. Shutting down.');
        process.exit(1);
    });
