import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
    assertPrerequisites,
    commandAvailable,
    createEnvironment,
    installDependencies,
    main,
    waitForMongoDB,
} from './onboarding.mjs';

describe('onboarding prerequisites', () => {
    it('accepts the pinned Node version and npm in setup mode', () => {
        expect(() => assertPrerequisites(true)).not.toThrow();
    });

    it('detects missing commands', () => {
        expect(commandAvailable('definitely-not-a-real-command')).toBe(false);
    });
});

describe('dependency installation', () => {
    const project = async () => {
        const directory = await mkdtemp(join(tmpdir(), 'pf-dependencies-'));
        await writeFile(join(directory, 'package-lock.json'), '{"lockfileVersion":3}\n');
        return directory;
    };

    it('runs npm ci and writes the current lock fingerprint when the marker is missing', async () => {
        const directory = await project();
        const commandRunner = vi.fn();
        await installDependencies({ directory, dependencyTreeStatus: () => true, commandRunner });

        expect(commandRunner).toHaveBeenCalledWith('npm', ['ci'], { cwd: directory });
        expect(await readFile(join(directory, 'node_modules', '.onboarding-lock.sha256'), 'utf8')).toMatch(
            /^[a-f0-9]{64}\n$/,
        );
    });

    it('reuses a valid tree only while the package lock fingerprint matches', async () => {
        const directory = await project();
        const commandRunner = vi.fn();
        const options = { directory, dependencyTreeStatus: () => true, commandRunner };
        await installDependencies(options);
        commandRunner.mockClear();
        await installDependencies(options);
        expect(commandRunner).not.toHaveBeenCalled();

        await writeFile(join(directory, 'package-lock.json'), '{"lockfileVersion":3,"changed":true}\n');
        await installDependencies(options);
        expect(commandRunner).toHaveBeenCalledWith('npm', ['ci'], { cwd: directory });
    });

    it('repairs an invalid tree even when its fingerprint marker matches', async () => {
        const directory = await project();
        await mkdir(join(directory, 'node_modules'));
        const commandRunner = vi.fn();
        await installDependencies({ directory, dependencyTreeStatus: () => false, commandRunner });
        expect(commandRunner).toHaveBeenCalledOnce();
    });
});

describe('environment file safety', () => {
    it('creates a private file containing only hashed credentials', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'pf-env-'));
        const envPath = join(directory, '.env');
        const password = await createEnvironment({
            envPath,
            hashPassword: async () => '$2b$12$test-hash',
            randomString: (bytes) => (bytes === 18 ? 'plain-generated-password' : 'a'.repeat(64)),
        });
        const contents = await readFile(envPath, 'utf8');

        expect(password).toBe('plain-generated-password');
        expect(contents).toContain('AUTH_PASSWORD_HASH=$2b$12$test-hash');
        expect(contents).not.toContain('plain-generated-password');
        expect(contents).toContain('CORS_ORIGINS=http://localhost:4200');
        expect((await stat(envPath)).mode & 0o777).toBe(0o600);
    });

    it('preserves an existing environment byte-for-byte', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'pf-env-'));
        const envPath = join(directory, '.env');
        await writeFile(envPath, 'EXISTING=value\n', { mode: 0o640 });

        expect(await createEnvironment({ envPath })).toBeNull();
        expect(await readFile(envPath, 'utf8')).toBe('EXISTING=value\n');
    });
});

describe('orchestration', () => {
    it('setup validates config without touching Docker, seed, or dev', async () => {
        const calls = [];
        await main(['--setup'], {
            assertPrerequisites: (setupOnly) => calls.push(['prerequisites', setupOnly]),
            installDependencies: async () => calls.push(['dependencies']),
            createEnvironment: async () => null,
            run: (command, args) => calls.push([command, ...args]),
            waitForMongoDB: async () => calls.push(['wait']),
            startDevelopment: async () => calls.push(['dev']),
        });

        expect(calls).toEqual([['prerequisites', true], ['dependencies'], ['npm', 'run', 'env:check']]);
    });

    it('shows a generated password once and runs compose, seed, then dev', async () => {
        const calls = [];
        const output = vi.spyOn(console, 'info').mockImplementation(() => undefined);
        await main([], {
            assertPrerequisites: () => undefined,
            installDependencies: async () => undefined,
            createEnvironment: async () => 'one-time-password',
            run: (command, args) => calls.push([command, ...args]),
            waitForMongoDB: async () => calls.push(['wait']),
            startDevelopment: async () => calls.push(['dev']),
        });

        expect(calls).toEqual([
            ['npm', 'run', 'env:check'],
            ['docker', 'compose', 'up', '-d', 'mongodb'],
            ['wait'],
            ['npm', 'run', 'seed'],
            ['dev'],
        ]);
        expect(output.mock.calls.flat().join(' ')).toContain('one-time-password');
        expect(
            output.mock.calls
                .flat()
                .join(' ')
                .match(/one-time-password/g),
        ).toHaveLength(1);
        output.mockRestore();
    });

    it('fails after the readiness deadline', async () => {
        let clock = 0;
        await expect(
            waitForMongoDB({
                timeoutMs: 2,
                ping: async () => false,
                now: () => clock,
                delay: async () => {
                    clock += 1;
                },
            }),
        ).rejects.toThrow('did not become healthy');
    });
});
