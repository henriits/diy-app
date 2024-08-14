import { z } from "zod";
import type { Selectable } from "kysely";
import type { ProjectCategoryAssignments } from "@server/database/types";
import { idSchema } from "./shared";

// Define the Zod schema for a project category assignment
export const projectCategoryAssignmentSchema = z.object({
    projectId: idSchema,
    categoryId: idSchema,
});

// Extract all keys from the schema
export const projectCategoryAssignmentKeysAll = Object.keys(
    projectCategoryAssignmentSchema.shape
) as (keyof ProjectCategoryAssignments)[];

export const projectCategoryAssignmentKeysPublic =
    projectCategoryAssignmentKeysAll;

export type ProjectCategoryAssignmentPublic = Pick<
    Selectable<ProjectCategoryAssignments>,
    (typeof projectCategoryAssignmentKeysPublic)[number]
>;

// Define a schema for creating or updating a project category assignment
export const createProjectCategoryAssignmentSchema =
    projectCategoryAssignmentSchema;

export type CreateProjectCategoryAssignment = z.infer<
    typeof createProjectCategoryAssignmentSchema
>;
