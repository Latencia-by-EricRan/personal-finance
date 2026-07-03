import { beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { getHealth } from './health.controller';

const response = {
    status: vi.fn(),
    json: vi.fn(),
};
response.status.mockReturnValue(response);

describe('getHealth', () => {
    beforeEach(() => vi.clearAllMocks());

    it.each([
        [1, 200, 'connected'],
        [0, 503, 'disconnected'],
    ])('maps Mongoose state %s to HTTP %s', (readyState, status, database) => {
        vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(readyState as 0 | 1);
        getHealth({} as never, response as never);
        expect(response.status).toHaveBeenCalledWith(status);
        expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ database }));
    });
});
