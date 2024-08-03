import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("project_categories")
        .addColumn("id", "integer", (c) =>
            c.primaryKey().generatedAlwaysAsIdentity()
        )
        .addColumn("name", "text", (c) => c.notNull().unique())
        .addColumn("created_at", "timestamptz", (column) =>
            column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
        )
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("project_categories").execute();
}
