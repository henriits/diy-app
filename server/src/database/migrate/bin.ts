import "dotenv/config";
import * as path from "path";
import * as fs from "fs/promises";
import { Pool } from "pg";
import { FileMigrationProvider, Kysely, PostgresDialect } from "kysely";
import { migrateToLatest } from "."; // Adjust path if needed

const MIGRATION_PATH = "../migrations";

async function migrateDefault(url: string) {
    const pool = new Pool({ connectionString: url });

    const db = new Kysely({
        dialect: new PostgresDialect({
            pool,
        }),
    });

    const nodeProvider = new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, MIGRATION_PATH),
    });

    const { error, results } = await migrateToLatest(nodeProvider, db);

    results?.forEach((it) => {
        if (it.status === "Success") {
            console.log(
                `migration "${it.migrationName}" was executed successfully`
            );
        } else if (it.status === "Error") {
            console.error(`failed to execute migration "${it.migrationName}"`);
        }
    });

    if (error) {
        console.log("failed to migrate");
        console.log(error);
        process.exit(1);
    }

    await pool.end();
}

if (require.main === module) {
    const { DATABASE_URL } = process.env;

    if (typeof DATABASE_URL !== "string") {
        throw new Error("Provide DATABASE_URL in your environment variables");
    }

    migrateDefault(DATABASE_URL);
}
