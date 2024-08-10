// https://github.com/henriits/monorepo-hands-on/blob/main/server/src/repositories/articleRepository.ts

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

        async findById(id: number): Promise<ProjectPublic | undefined> {
            return db
                .selectFrom("projects")
                .select(projectKeysPublic)
                .where("id", "=", id)
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
        async findByTitle(title: string): Promise<ProjectPublic[]> {
            return db
                .selectFrom("projects")
                .select(projectKeysPublic)
                .where("title", "like", `%${title}%`)
                .orderBy("id", "desc") // Optional ordering
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
