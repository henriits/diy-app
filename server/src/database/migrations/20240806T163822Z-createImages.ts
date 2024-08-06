import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("project_images")
        .addColumn("id", "integer", (c) =>
            c.primaryKey().generatedAlwaysAsIdentity()
        )
        .addColumn("project_id", "integer", (c) =>
            c.references("projects.id").onDelete("cascade").notNull()
        )
        .addColumn("image_url", "text", (c) => c.notNull())
        .addColumn("created_at", "timestamptz", (column) =>
            column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
        )
        .execute();
}

export async function down(db: Kysely<any>) {
    // Add your migration down logic here
    await db.schema.dropTable("project_images").execute();
}
