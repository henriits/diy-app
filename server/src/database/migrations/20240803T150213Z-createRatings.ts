import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("ratings")
        .addColumn("id", "integer", (c) =>
            c.primaryKey().generatedAlwaysAsIdentity()
        )
        .addColumn("rating", "integer", (c) =>
            c.check(sql`rating >= 1 AND rating <= 5`).notNull()
        )
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
    await db.schema.dropTable("ratings").execute();
}
