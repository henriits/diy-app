import type { Database, Ratings } from "@server/database";
import type { Insertable } from "kysely";
import { type RatingPublic, ratingKeysPublic } from "@server/entities/ratings";

/**
 * Repository for managing ratings.
 * @param db - The database instance.
 * @returns The repository with methods to interact with ratings.
 */
export function ratingsRepository(db: Database) {
    return {
        /**
         * Creates a new project rating and returns it.
         * @param rating - The rating data to be inserted.
         * @returns The created project rating.
         */
        async create(rating: Insertable<Ratings>): Promise<RatingPublic> {
            return db
                .insertInto("ratings")
                .values(rating)
                .returning(ratingKeysPublic)
                .executeTakeFirstOrThrow();
        },

        /**
         * Updates an existing rating by id.
         * @param id - The id of the rating to update.
         * @param updates - The rating data to update.
         * @returns The updated rating, or undefined if the rating does not exist.
         */
        async update(
            id: number,
            updates: Partial<Insertable<Ratings>>
        ): Promise<RatingPublic | undefined> {
            const result = await db
                .updateTable("ratings")
                .set(updates)
                .where("id", "=", id)
                .returning(ratingKeysPublic)
                .executeTakeFirst();

            return result ?? undefined;
        },

        /**
         * Deletes a rating by id.
         * @param id - The id of the rating to delete.
         * @returns The number of deleted rows.
         */
        async delete(id: number): Promise<number> {
            const result = await db
                .deleteFrom("ratings")
                .where("id", "=", id)
                .execute();

            return result.length;
        },

        /**
         * Finds a rating by id.
         * @param id - The id of the rating to find.
         * @returns The found rating, or undefined if the rating does not exist.
         */
        async findById(id: number): Promise<RatingPublic | undefined> {
            const result = await db
                .selectFrom("ratings")
                .selectAll()
                .where("id", "=", id)
                .executeTakeFirst();

            return result ?? undefined;
        },
    };
}
