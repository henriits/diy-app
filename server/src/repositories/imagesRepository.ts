import type { Database, ProjectImages, DB } from "@server/database";
import {
    type ImagePublic,
    imageKeysPublic,
} from "@server/entities/projectImages";
import { type UserPublic, userKeysPublic } from "@server/entities/users";
import type {
    AliasedRawBuilder,
    ExpressionBuilder,
    Insertable,
    Updateable,
} from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";

/**
 * Repository for managing images.
 * @param db - The database instance.
 * @returns The repository with methods to interact with images.
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
        /**
         * Finds a image by its ID.
         * @param id - The ID of the image to find.
         * @returns The image with the specified ID.
         */
        async findById(id: number): Promise<ImagePublic | null> {
            const image = await db
                .selectFrom("projectImages")
                .select(imageKeysPublic)
                .select(withAuthor)
                .where("projectImages.id", "=", id)
                .executeTakeFirst();

            // Return null if no image is found, otherwise return the image
            return image ?? null;
        },
        /**
         * Finds all images associated with a specific project ID.
         * @param projectId - The ID of the project to find images for.
         * @returns An array of images for the specified project.
         */
        async findByProjectId(projectId: number): Promise<ImagePublic[]> {
            return db
                .selectFrom("projectImages")
                .select(imageKeysPublic)
                .select(withAuthor)
                .where("projectId", "=", projectId)
                .orderBy("projectImages.id", "asc")
                .execute();
        },
        /**
         * Updates a image by ID and returns the updated image.
         * @param id - The ID of the image to update.
         * @param data - The updated image data.
         * @returns The updated image.
         */
        async updateById(
            id: number,
            data: Updateable<ImagePublic>
        ): Promise<ImagePublic> {
            return db
                .updateTable("projectImages")
                .set(data)
                .where("id", "=", id)
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
