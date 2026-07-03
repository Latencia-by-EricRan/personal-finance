import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
    mongoConnectionString: string;
    mongoDatabaseName: string;
    port: number;
    corsOrigins: string[];
    authEmail: string;
    authPasswordHash: string;
    jwtSecret: string;
    jwtExpiresIn: string;
}

const required = (key: string, environment: NodeJS.ProcessEnv = process.env): string => {
    const value = environment[key]?.trim();
    if (!value) throw new Error(`[Config] Missing required environment variable: ${key}`);
    return value;
};

const parsePort = (value: string): number => {
    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('[Config] PORT must be an integer between 1 and 65535');
    }
    return port;
};

const parseOrigins = (value: string): string[] =>
    value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .map((origin) => {
            try {
                return new URL(origin).origin;
            } catch {
                throw new Error(`[Config] Invalid CORS_ORIGINS URL: ${origin}`);
            }
        });

export const loadEnvironment = (environment: NodeJS.ProcessEnv = process.env): EnvironmentConfig => {
    const mongoConnectionString = required('MONGO_CONN_STR', environment);
    if (!/^mongodb(?:\+srv)?:\/\//.test(mongoConnectionString)) {
        throw new Error('[Config] MONGO_CONN_STR must be a MongoDB connection string');
    }

    const authEmail = required('AUTH_EMAIL', environment);
    if (!/^\S+@\S+\.\S+$/.test(authEmail)) throw new Error('[Config] AUTH_EMAIL must be a valid email');

    const authPasswordHash = required('AUTH_PASSWORD_HASH', environment);
    if (!/^\$2[aby]\$\d{2}\$/.test(authPasswordHash)) {
        throw new Error('[Config] AUTH_PASSWORD_HASH must be a bcrypt hash');
    }

    const jwtSecret = required('JWT_SECRET', environment);
    if (jwtSecret.length < 6) throw new Error('[Config] JWT_SECRET must contain at least 6 characters');

    return {
        mongoConnectionString,
        mongoDatabaseName: required('MONGO_DB_NAME', environment),
        port: parsePort(environment.PORT?.trim() || '80'),
        corsOrigins: parseOrigins(environment.CORS_ORIGINS?.trim() || ''),
        authEmail,
        authPasswordHash,
        jwtSecret,
        jwtExpiresIn: environment.JWT_EXPIRES_IN?.trim() || '1d',
    };
};
