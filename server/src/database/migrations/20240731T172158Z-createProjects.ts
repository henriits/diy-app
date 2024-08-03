import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    // Add your migration up logic here
    await db.schema
        .createTable("projects")
        .addColumn("id", "integer", (c) =>
            c.primaryKey().generatedAlwaysAsIdentity()
        )
        .addColumn("title", "text", (c) => c.notNull())
        .addColumn("description", "text")
        .addColumn("instructions", "text")
        .addColumn("materials", "text")
        .addColumn("user_id", "integer", (c) =>
            c.references("users.id").onDelete("cascade").notNull()
        )
        .addColumn("created_at", "timestamptz", (column) =>
            column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
        )
        .addColumn("updated_at", "timestamptz", (column) =>
            column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
        )
        .execute();
}

export async function down(db: Kysely<any>) {
    // Add your migration down logic here
    await db.schema.dropTable("projects").execute();
}
