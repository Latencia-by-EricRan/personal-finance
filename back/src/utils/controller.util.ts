import { Request } from 'express';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

type Pagination = { limit: number; skip: number };

const toMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'Internal server error';

const toPagination = (query: Request['query']): Pagination => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    return { limit, skip: (page - 1) * limit };
};

export {
    toMessage,
    toPagination,
};
export type { Pagination };
