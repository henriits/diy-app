import { z } from "zod";
import type { Selectable } from "kysely";
import type { Projects } from "@server/database/types";
import { createdAtSchema, idSchema } from "./shared";

export const projectSchema = z.object({
    id: idSchema,
    title: z
        .string()
        .trim()
        .min(1, "Title cannot be empty")
        .max(255, "Title must be at most 255 characters long"),
    description: z.string().trim().optional(),
    instructions: z.string().trim(),
    materials: z.string().trim().optional(),
    userId: z.number().int().positive(),
    createdAt: createdAtSchema,
    updatedAt: createdAtSchema,
});

export const projectKeysAll = Object.keys(
    projectSchema.shape
) as (keyof Selectable<Projects>)[];

export const projectKeysPublic = [
    "id",
    "title",
    "description",
    "instructions",
    "materials",
    "userId",
    "createdAt",
    "updatedAt",
] as const;

export type ProjectPublic = Pick<
    Selectable<Projects>,
    (typeof projectKeysPublic)[number]
>;
// Define a schema for creating or updating a project
export const createProjectSchema = projectSchema.pick({
    title: true,
    description: true,
    instructions: true,
    materials: true,
});

export const updateProjectSchema = createProjectSchema.partial();
// Types for creating and updating projects
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
