import { type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("project_category_assignments")
        .addColumn("project_id", "integer", (c) =>
            c.references("projects.id").onDelete("cascade").notNull()
        )
        .addColumn("category_id", "integer", (c) =>
            c.references("project_categories.id").onDelete("cascade").notNull()
        )
        .addPrimaryKeyConstraint("pk_project_category_assignments", [
            "project_id",
            "category_id",
        ])
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("project_category_assignments").execute();
}
