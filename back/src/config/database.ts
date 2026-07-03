import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env?.MONGO_CONN_STR ?? '';
const dbName = process.env?.MONGO_DB_NAME ?? '';

mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Conexión perdida');
});

mongoose.connection.on('error', (error: Error) => {
    console.error('[MongoDB] Error en la conexión:', error.message ?? error);
});

const gracefulShutdown = async (signal: string): Promise<void> => {
    console.info(`[MongoDB] ${ signal } recibido, cerrando conexión...`);
    await mongoose.connection.close();
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const connectDB = async (): Promise<string> => {
    try {
        await mongoose.connect(uri, {
            dbName: dbName,
            checkKeys: true,
            autoIndex: true,
            sanitizeFilter: true,
        });
        return `[MongoDB] Conexión a ${ dbName } establecida`;
    } catch (error: unknown) {
        console.error('[MongoDB] Error en la conexión con MongoDB:', error instanceof Error ? error.message : error);
        throw error;
    }
}

export default connectDB;
