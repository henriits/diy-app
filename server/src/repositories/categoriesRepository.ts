import type { Database, ProjectCategories } from "@server/database";
import {
    projectCategoryKeysPublic,
    type ProjectCategoryPublic,
} from "@server/entities/categories";

import { type Insertable } from "kysely";

/**
 * Repository for managing project categories.
 * @param db - The database instance.
 * @returns The repository with methods to interact with project categories.
 */
export function categoriesRepository(db: Database) {
    return {
        /**
         * Creates a new project category and returns it.
         * @param category - The category data to be inserted.
         * @returns The created project category.
         */
        async create(
            category: Insertable<ProjectCategories>
        ): Promise<ProjectCategoryPublic> {
            return db
                .insertInto("projectCategories")
                .values(category)
                .returning(projectCategoryKeysPublic)
                .executeTakeFirstOrThrow();
        },
    };
}

/**
 * Type for the categoriesRepository.
 */
export type CategoriesRepository = ReturnType<typeof categoriesRepository>;
