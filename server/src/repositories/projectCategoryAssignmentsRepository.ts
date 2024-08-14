import type { Database, ProjectCategoryAssignments } from "@server/database";
import {
    projectCategoryAssignmentKeysPublic,
    type ProjectCategoryAssignmentPublic,
} from "@server/entities/projectCategoryAssignments";
import { type Insertable } from "kysely";

/**
 * Repository for managing project category assignments.
 * @param db - The database instance.
 * @returns The repository with methods to interact with project category assignments.
 */
export function projectCategoryAssignmentsRepository(db: Database) {
    return {
        /**
         * Creates a new project category assignment and returns it.
         * @param assignment - The assignment data to be inserted.
         * @returns The created project category assignment.
         */
        async create(
            assignment: Insertable<ProjectCategoryAssignments>
        ): Promise<ProjectCategoryAssignmentPublic> {
            return db
                .insertInto("projectCategoryAssignments")
                .values(assignment)
                .returning(projectCategoryAssignmentKeysPublic)
                .executeTakeFirstOrThrow();
        },

        /**
         * Checks if a project with the given ID exists.
         * @param projectId - The ID of the project to check.
         * @returns True if the project exists, otherwise false.
         */
        async projectExists(projectId: number): Promise<boolean> {
            const result = await db
                .selectFrom("projects")
                .where("id", "=", projectId)
                .select(["id"])
                .executeTakeFirst();
            return result !== null;
        },

        /**
         * Checks if a category with the given ID exists.
         * @param categoryId - The ID of the category to check.
         * @returns True if the category exists, otherwise false.
         */
        async categoryExists(categoryId: number): Promise<boolean> {
            const result = await db
                .selectFrom("projectCategories")
                .where("id", "=", categoryId)
                .select(["id"])
                .executeTakeFirst();
            return result !== null;
        },

        /**
         * Checks if an assignment with the given project ID and category ID already exists.
         * @param projectId - The ID of the project.
         * @param categoryId - The ID of the category.
         * @returns True if the assignment exists, otherwise false.
         */
        async assignmentExists(
            projectId: number,
            categoryId: number
        ): Promise<boolean> {
            const result = await db
                .selectFrom("projectCategoryAssignments")
                .where("projectId", "=", projectId)
                .where("categoryId", "=", categoryId)
                .select(["projectId", "categoryId"])
                .executeTakeFirst();

            if (result) {
                return true;
            }

            return false;
        },
    };
}

/**
 * Type for the projectCategoryAssignmentsRepository.
 */
export type ProjectCategoryAssignmentsRepository = ReturnType<
    typeof projectCategoryAssignmentsRepository
>;
