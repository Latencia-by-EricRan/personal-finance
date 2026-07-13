import 'dotenv/config';
import { createApp } from './app';
import MongoDB from './config/database';

// Puerto de la aplicación
const port = process.env.PORT ?? 80;

MongoDB()
    .then((message) => {
        const app = createApp();
        app.listen(port, () => {
            console.info(message, `\n[Server] Running at http://localhost:${port}`);
        });
    })
    .catch(() => {
        console.error('[Server] Database connection failed. Shutting down.');
        process.exit(1);
    });
