import type { Database, ProjectImages, DB } from "@server/database";
import {
    type ImagePublic,
    imageKeysPublic,
} from "@server/entities/projectImages";
import { type UserPublic, userKeysPublic } from "@server/entities/users";
import type { AliasedRawBuilder, ExpressionBuilder, Insertable } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";

/**
 * Repository for managing comments.
 * @param db - The database instance.
 * @returns The repository with methods to interact with comments.
 */

export function imageRepository(db: Database) {
    return {
        /**
         * Creates a new image  and returns it with author details.
         * @param image - The image  data to be inserted.
         * @returns The created image with author information.
         */
        async create(image: Insertable<ProjectImages>): Promise<ImagePublic> {
            return db
                .insertInto("projectImages")
                .values(image)
                .returning(imageKeysPublic)
                .returning(withAuthor)
                .executeTakeFirstOrThrow();
        },
    };
}

/**
 * Constructs a subquery to retrieve author details for images.
 * @param eb - The expression builder instance.
 * @returns An expression builder with author details.
 */
function withAuthor(eb: ExpressionBuilder<DB, "projectImages">) {
    return jsonObjectFrom(
        eb
            .selectFrom("users")
            .select(userKeysPublic)
            .whereRef("users.id", "=", "projectImages.userId")
    ).as("author") as AliasedRawBuilder<UserPublic, "author">;
}

export type ImageRepository = ReturnType<typeof imageRepository>;
