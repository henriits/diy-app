import type { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    // Add your migration up logic here
    await db.schema
        .alterTable("project_images")
        .addColumn("user_id", "integer", (c) =>
            c.references("users.id").onDelete("cascade").notNull()
        )
        .execute();
}

export async function down(db: Kysely<any>) {
    // Add your migration down logic here
    await db.schema
        .alterTable("project_images")
        .dropColumn("description")
        .execute();
}
