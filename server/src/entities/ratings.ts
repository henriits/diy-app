import { z } from "zod";
import type { Selectable } from "kysely";
import type { Ratings } from "@server/database";
import { createdAtSchema, idSchema } from "./shared";

export const ratingSchema = z.object({
    id: idSchema,
    rating: z.number().int().min(1).max(5),
    projectId: z.number().int(),
    userId: z.number().int(),
    createdAt: createdAtSchema,
});

export const ratingKeysPublic: (keyof Selectable<Ratings>)[] = [
    "id",
    "rating",
    "projectId",
    "userId",
    "createdAt",
];

export type RatingPublic = Pick<
    Selectable<Ratings>,
    (typeof ratingKeysPublic)[number]
>;

export const createRatingSchema = ratingSchema.pick({
    rating: true,
    projectId: true,
});

export type CreateRating = z.infer<typeof createRatingSchema>;
export const updateRatingSchema = createRatingSchema.partial();

export type UpdateRating = z.infer<typeof updateRatingSchema>;
