const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`[Auth] Missing required environment variable: ${key}`);
    return value;
};

export const authConfig = {
    jwtSecret: required('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    authEmail: required('AUTH_EMAIL'),
    authPasswordHash: required('AUTH_PASSWORD_HASH'),
};
