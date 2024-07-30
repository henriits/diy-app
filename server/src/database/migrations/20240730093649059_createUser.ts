import { Kysely, PostgresDialect } from "kysely";

export async function up(db: Kysely<PostgresDialect>) {
    // Add your migration up logic here
    await db.schema
        .createTable("users")
        .addColumn("id", "serial", (col) => col.notNull())
        .addColumn("name", "varchar(100)", (col) => col.notNull())
        .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
        .addColumn("password", "varchar(255)", (col) => col.notNull())
        .execute(); // Increased length for hashed passwords
}

export async function down(db: Kysely<PostgresDialect>) {
    // Add your migration down logic here
    await db.schema.dropTable("users").execute();
}
