import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DB } from "./types"; // Make sure this matches your DB schema

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Set to true in production if using SSL
    },
});

const db = new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
    // Add any additional configurations if needed
});

export { db };
