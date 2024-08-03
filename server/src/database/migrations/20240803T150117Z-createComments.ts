import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("comments")
        .addColumn("id", "integer", (c) =>
            c.primaryKey().generatedAlwaysAsIdentity()
        )
        .addColumn("content", "text", (c) => c.notNull())
        .addColumn("user_id", "integer", (c) =>
            c.references("users.id").onDelete("cascade").notNull()
        )
        .addColumn("project_id", "integer", (c) =>
            c.references("projects.id").onDelete("cascade").notNull()
        )
        .addColumn("created_at", "timestamptz", (column) =>
            column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
        )
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("comments").execute();
}
