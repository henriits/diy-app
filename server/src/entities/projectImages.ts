import type { ProjectImages } from "@server/database";
import { z } from "zod";
import type { Selectable } from "kysely";
import { idSchema } from "./shared";
import type { UserPublic } from "./users";

export const imageSchema = z.object({
    id: idSchema,
    userId: idSchema,
    projectId: idSchema,
    imageUrl: z.string().trim().url(),
});

export const imageKeysAll = Object.keys(
    imageSchema.shape
) as (keyof ProjectImages)[];

export const imageKeysPublic = imageKeysAll;

export type ImagePublic = Pick<
    Selectable<ProjectImages>,
    (typeof imageKeysPublic)[number]
> & { author: UserPublic };
