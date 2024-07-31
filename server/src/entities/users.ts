import { z } from "zod";
import type { Selectable } from "kysely";
import type { Users } from "@server/database/types";
import { createdAtSchema, idSchema } from "./shared";

export const userSchema = z.object({
    id: idSchema,
    firstName: z
        .string()
        .trim()
        .min(1, "First name cannot be empty")
        .max(50, "First name must be at most 50 characters long"),
    lastName: z
        .string()
        .trim()
        .min(1, "Last name cannot be empty")
        .max(50, "Last name must be at most 50 characters long"),
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must be at most 30 characters long")
        .regex(
            /^[a-z0-9_.]+$/,
            "Username can only contain letters, numbers, underscores, and periods"
        ),
    email: z.string().trim().toLowerCase().email(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long"),
    isAdmin: z.boolean(),
    createdAt: createdAtSchema,
});

export const userKeysAll = Object.keys(
    userSchema.shape
) as (keyof Selectable<Users>)[];

// Adjust public keys to include all fields except sensitive information
export const userKeysPublic = [
    "id",
    "firstName",
    "lastName",
    "username",
    "email",
    "isAdmin",
    "createdAt",
] as const;

export type UserPublic = Pick<
    Selectable<Users>,
    (typeof userKeysPublic)[number]
>;

// Adjust authentication user schema
export const authUserSchema = userSchema.pick({
    id: true,
    isAdmin: true,
});
export type AuthUser = z.infer<typeof authUserSchema>;
