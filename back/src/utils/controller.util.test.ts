import { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { toMessage, toPagination } from './controller.util';

describe('toMessage', () => {
    it('returns the error message when given an Error instance', () => {
        expect(toMessage(new Error('boom'))).toBe('boom');
    });

    it('returns a generic message when given a non-Error value', () => {
        expect(toMessage('boom')).toBe('Internal server error');
    });
});

describe('toPagination', () => {
    it('defaults to page 1, limit 50 when no query params are given', () => {
        const query = {} as Request['query'];
        expect(toPagination(query)).toEqual({ limit: 50, skip: 0 });
    });

    it('computes skip/limit from page/limit query params', () => {
        const query = { page: '2', limit: '10' } as unknown as Request['query'];
        expect(toPagination(query)).toEqual({ limit: 10, skip: 10 });
    });

    it('caps limit at MAX_PAGE_SIZE (200)', () => {
        const query = { limit: '9999' } as unknown as Request['query'];
        expect(toPagination(query)).toEqual({ limit: 200, skip: 0 });
    });

    it('floors page and limit at 1', () => {
        const query = { page: '-5', limit: '-5' } as unknown as Request['query'];
        expect(toPagination(query)).toEqual({ limit: 1, skip: 0 });
    });
});
