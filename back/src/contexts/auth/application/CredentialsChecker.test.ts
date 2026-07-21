import bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';
import { CredentialsChecker } from './CredentialsChecker';

const EMAIL = 'developer@local.test';
const PASSWORD = 'correct-password';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);

const buildChecker = (): CredentialsChecker => new CredentialsChecker({ email: EMAIL, passwordHash: PASSWORD_HASH });

describe('CredentialsChecker.verify', () => {
    it('resolves true for the configured email with the matching password', async () => {
        const checker = buildChecker();

        await expect(checker.verify(EMAIL, PASSWORD)).resolves.toBe(true);
    });

    it('resolves false for the configured email with an incorrect password', async () => {
        const checker = buildChecker();

        await expect(checker.verify(EMAIL, 'wrong-password')).resolves.toBe(false);
    });

    it('resolves false for an unknown email without comparing the password hash', async () => {
        const compare = vi.spyOn(bcrypt, 'compare');
        const checker = buildChecker();

        await expect(checker.verify('other@local.test', PASSWORD)).resolves.toBe(false);
        expect(compare).not.toHaveBeenCalled();

        compare.mockRestore();
    });
});
