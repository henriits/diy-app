import { z } from "zod";
import type { Selectable } from "kysely";
import type { ProjectCategories } from "@server/database/types";
import { idSchema } from "./shared";

// Define the Zod schema for a project category
export const projectCategorySchema = z.object({
    id: idSchema,
    name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .max(255, "Name must be at most 255 characters long"),
});

// Extract all keys from the schema
export const projectCategoryKeysAll = Object.keys(
    projectCategorySchema.shape
) as (keyof ProjectCategories)[];

export const projectCategoryKeysPublic = projectCategoryKeysAll;

export type ProjectCategoryPublic = Pick<
    Selectable<ProjectCategories>,
    (typeof projectCategoryKeysPublic)[number]
>;

// Define a schema for creating or updating a project category
export const createProjectCategorySchema = projectCategorySchema.pick({
    name: true,
});

export const updateProjectCategorySchema =
    createProjectCategorySchema.partial();

// Types for creating and updating project categories
export type CreateProjectCategory = z.infer<typeof createProjectCategorySchema>;
export type UpdateProjectCategory = z.infer<typeof updateProjectCategorySchema>;
