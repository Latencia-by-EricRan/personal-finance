import { constants } from 'node:fs';
import { access, chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const REQUIRED_NODE_VERSION = '22.22.3';
const ENV_PATH = '.env';

export const commandAvailable = (command, args = ['--version']) => {
    const result = spawnSync(command, args, { stdio: 'ignore' });
    return result.status === 0;
};

export const assertPrerequisites = (setupOnly = false) => {
    const currentVersion = process.versions.node;
    if (currentVersion !== REQUIRED_NODE_VERSION) {
        throw new Error(`Node ${REQUIRED_NODE_VERSION} is required (current: ${currentVersion}). Run: nvm use`);
    }
    if (!commandAvailable('npm')) throw new Error('npm is required and was not found in PATH.');
    if (!setupOnly && !commandAvailable('docker', ['compose', 'version'])) {
        throw new Error('Docker with Compose is required. Install/start Docker and retry.');
    }
};

export const run = (command, args, options = {}) => {
    const result = spawnSync(command, args, { stdio: 'inherit', ...options });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
};

const exists = async (path) => {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

const dependencyMarkerPath = (directory) => join(directory, 'node_modules', '.onboarding-lock.sha256');

export const packageLockFingerprint = async (directory = '.') => {
    const lockfile = await readFile(join(directory, 'package-lock.json'));
    return createHash('sha256').update(lockfile).digest('hex');
};

export const installDependencies = async ({ directory = '.', commandRunner = run, dependencyTreeStatus } = {}) => {
    const expectedFingerprint = await packageLockFingerprint(directory);
    const marker = await readFile(dependencyMarkerPath(directory), 'utf8').catch(() => '');
    const treeIsValid = dependencyTreeStatus
        ? dependencyTreeStatus(directory)
        : spawnSync('npm', ['ls', '--depth=0', '--silent'], { cwd: directory, stdio: 'ignore' }).status === 0;
    if (marker.trim() === expectedFingerprint && treeIsValid) return;
    console.info('[Quickstart] Installing dependencies with npm ci...');
    commandRunner('npm', ['ci'], { cwd: directory });
    await mkdir(join(directory, 'node_modules'), { recursive: true });
    await writeFile(dependencyMarkerPath(directory), `${expectedFingerprint}\n`, { mode: 0o600 });
};

export const createEnvironment = async ({
    envPath = ENV_PATH,
    randomString = (bytes) => randomBytes(bytes).toString('base64url'),
} = {}) => {
    if (await exists(envPath)) {
        console.info('[Quickstart] Existing .env preserved.');
        return null;
    }

    const password = randomString(18);
    const jwtSecret = randomString(48);
    const contents = [
        'MONGO_CONN_STR=mongodb://127.0.0.1:27017',
        'MONGO_DB_NAME=personal_finance',
        'PORT=3000',
        'CORS_ORIGINS=http://localhost:4200',
        'AUTH_ROOT_EMAIL=developer@local.test',
        `AUTH_ROOT_PASSWORD=${password}`,
        `JWT_SECRET=${jwtSecret}`,
        'JWT_EXPIRES_IN=1d',
        '',
    ].join('\n');

    await writeFile(envPath, contents, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    await chmod(envPath, 0o600);
    return password;
};

export const waitForMongoDB = async ({ timeoutMs = 60_000, ping, now = Date.now, delay } = {}) => {
    const deadline = now() + timeoutMs;
    while (now() < deadline) {
        const healthy = ping
            ? await ping()
            : (() => {
                  const result = spawnSync(
                      'docker',
                      [
                          'compose',
                          'exec',
                          '-T',
                          'mongodb',
                          'mongosh',
                          '--quiet',
                          '--eval',
                          'db.adminCommand({ ping: 1 }).ok',
                      ],
                      { encoding: 'utf8' },
                  );
                  return result.status === 0 && result.stdout.trim() === '1';
              })();
        if (healthy) return;
        await (delay ? delay() : new Promise((resolve) => setTimeout(resolve, 2_000)));
    }
    throw new Error('MongoDB did not become healthy within 60 seconds. Run: docker compose logs mongodb');
};

export const startDevelopment = () => {
    const child = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
    return new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (code, signal) => {
            if (signal || code === 0) resolve();
            else reject(new Error(`Development server exited with code ${code}.`));
        });
    });
};

export const main = async (args = process.argv.slice(2), overrides = {}) => {
    const dependencies = {
        assertPrerequisites,
        installDependencies,
        createEnvironment,
        run,
        waitForMongoDB,
        startDevelopment,
        ...overrides,
    };
    const setupOnly = args.includes('--setup');
    dependencies.assertPrerequisites(setupOnly);
    await dependencies.installDependencies();
    const password = await dependencies.createEnvironment();
    dependencies.run('npm', ['run', 'env:check']);

    if (password) {
        console.info('\n[Quickstart] Local credentials (password is shown only now):');
        console.info('  Email: developer@local.test');
        console.info(`  Password: ${password}\n`);
    }

    if (setupOnly) {
        console.info('[Setup] Environment prepared. Services were not started.');
        return;
    }

    dependencies.run('docker', ['compose', 'up', '-d', 'mongodb']);
    console.info('[Quickstart] Waiting for MongoDB...');
    await dependencies.waitForMongoDB();
    dependencies.run('npm', ['run', 'seed']);
    console.info('[Quickstart] Starting API. MongoDB will remain running after the API stops.');
    await dependencies.startDevelopment();
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        console.error(`[Quickstart] ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 1;
    });
}
