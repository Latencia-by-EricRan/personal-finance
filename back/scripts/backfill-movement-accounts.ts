/**
 * Backfill script — Movement.Account
 * ===================================
 * INT-03 (slice 2B, movement-account integration).
 *
 * Movement.Account became a required field once this slice landed (see
 * src/contexts/movement/infrastructure/MovementModel.ts). Any Movement document created before
 * that change has no Account and will fail validation on the next update
 * unless it's migrated first.
 *
 * What this script does:
 *   1. Finds (or creates) an Account named 'General' (Type: 'efectivo').
 *   2. Finds every Movement document missing an Account.
 *   3. Sets Account to the General account's _id on all of them via updateMany.
 *   4. Logs a summary (account created or reused, movements backfilled).
 *
 * ⚠️  MANUAL RUN REQUIRED — DO NOT RUN AUTOMATICALLY ⚠️
 * This script mutates real production data. It must be run manually by the
 * repo owner, with a real MONGO_CONN_STR pointing at the target database,
 * once — either right before or immediately after this change is deployed,
 * so existing movements remain writable once Account is required.
 *
 * Usage: npm run backfill-movement-accounts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AccountModel } from '../src/contexts/account';
import { MovementModel } from '../src/contexts/movement';

dotenv.config();

const uri = process.env?.MONGO_CONN_STR ?? '';
const dbName = process.env?.MONGO_DB_NAME ?? '';

const GENERAL_ACCOUNT_NAME = 'General';

const run = async (): Promise<void> => {
    if (!uri || !dbName) {
        console.error('Missing MONGO_CONN_STR or MONGO_DB_NAME in .env');
        process.exit(1);
    }

    await mongoose.connect(uri, { dbName });
    console.log(`[MongoDB] Connected to ${dbName}`);

    try {
        let generalAccount = await AccountModel.findOne({ Name: GENERAL_ACCOUNT_NAME });
        let created = false;

        if (!generalAccount) {
            generalAccount = await AccountModel.create({ Name: GENERAL_ACCOUNT_NAME, Type: 'efectivo' });
            created = true;
        }

        const result = await MovementModel.updateMany(
            { Account: { $exists: false } },
            { $set: { Account: generalAccount._id } },
        );

        console.log('\nBackfill summary');
        console.log('----------------');
        console.log(`General account: ${created ? 'created' : 'reused existing'} (${generalAccount._id})`);
        console.log(`Movements matched: ${result.matchedCount}`);
        console.log(`Movements backfilled: ${result.modifiedCount}`);
    } finally {
        await mongoose.connection.close();
    }
};

run()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
        console.error('Backfill failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    });
