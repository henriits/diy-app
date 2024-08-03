import { z } from "zod";
import type { Selectable } from "kysely";
import type { Comments } from "@server/database";
import { idSchema } from "./shared";
import type { UserPublic } from "./users";

export const commentSchema = z.object({
    id: idSchema,
    projectId: idSchema,
    userId: idSchema,
    content: z.string().trim(),
    createdAt: z.date().default(() => new Date()),
});

export const commentKeysAll = Object.keys(
    commentSchema.shape
) as (keyof Comments)[];

export const commentKeysPublic = commentKeysAll;

export type CommentPublic = Pick<
    Selectable<Comments>,
    (typeof commentKeysPublic)[number]
> & { author: UserPublic };
