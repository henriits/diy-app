import type { Database, Projects } from "@server/database";
import type { Insertable } from "kysely";
import {
    type ProjectPublic,
    projectKeysPublic,
} from "@server/entities/projects";

type Pagination = {
    offset: number;
    limit: number;
};

export function projectRepository(db: Database) {
    return {
        async create(data: Insertable<Projects>): Promise<ProjectPublic> {
            return db
                .insertInto("projects")
                .values(data)
                .returning(projectKeysPublic)
                .executeTakeFirstOrThrow();
        },

        async findById(
            id: number
        ): Promise<(ProjectPublic & { username: string }) | undefined> {
            return db
                .selectFrom("projects")
                .innerJoin("users", "projects.userId", "users.id")
                .select([
                    ...projectKeysPublic.map(
                        (key) => `projects.${key}` as keyof Projects
                    ),
                    "users.username",
                ])
                .where("projects.id", "=", id)
                .executeTakeFirst();
        },

        async update(
            id: number,
            data: Partial<Insertable<Projects>>
        ): Promise<ProjectPublic | undefined> {
            return db
                .updateTable("projects")
                .set({ ...data, updatedAt: new Date() })
                .where("id", "=", id)
                .returning(projectKeysPublic)
                .executeTakeFirst();
        },

        async delete(id: number): Promise<void> {
            await db.deleteFrom("projects").where("id", "=", id).execute();
        },

        async findAll({ offset, limit }: Pagination): Promise<ProjectPublic[]> {
            return db
                .selectFrom("projects")
                .select(projectKeysPublic)
                .orderBy("id", "desc") // Adjust the ordering field as necessary
                .offset(offset)
                .limit(limit)
                .execute();
        },
        async findByTitle(
            title: string
        ): Promise<(ProjectPublic & { username: string })[]> {
            return db
                .selectFrom("projects")
                .innerJoin("users", "projects.userId", "users.id")
                .select([
                    ...projectKeysPublic.map(
                        (key) => `projects.${key}` as keyof Projects
                    ), // Prefix project fields with "projects."
                    "users.username", // Add the username field from users table
                ])
                .where("projects.title", "like", `%${title}%`)
                .orderBy("projects.id", "desc") // Specify that the ordering is by the project ID
                .execute();
        },

        async hasUserId(projectId: number, userId: number): Promise<boolean> {
            const project = await db
                .selectFrom("projects")
                .select("userId")
                .where("id", "=", projectId)
                .executeTakeFirst();

            return project?.userId === userId;
        },
    };
}

export type ProjectRepository = ReturnType<typeof projectRepository>;
