import type { Database, Comments, DB } from "@server/database";
import {
    type CommentPublic,
    commentKeysPublic,
} from "@server/entities/comments";
import { type UserPublic, userKeysPublic } from "@server/entities/users";

import {
    type AliasedRawBuilder,
    type ExpressionBuilder,
    type Insertable,
    type Updateable,
} from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";

/**
 * Repository for managing comments.
 * @param db - The database instance.
 * @returns The repository with methods to interact with comments.
 */
export function commentRepository(db: Database) {
    return {
        /**
         * Creates a new comment and returns it with author details.
         * @param comment - The comment data to be inserted.
         * @returns The created comment with author information.
         */
        async create(comment: Insertable<Comments>): Promise<CommentPublic> {
            return db
                .insertInto("comments")
                .values(comment)
                .returning(commentKeysPublic)
                .returning(withAuthor)
                .executeTakeFirstOrThrow();
        },
        /**
         * Finds a comment by its ID.
         * @param id - The ID of the comment to find.
         * @returns The comment with the specified ID.
         */
        async findById(id: number): Promise<CommentPublic | null> {
            const comment = await db
                .selectFrom("comments")
                .select(commentKeysPublic)
                .select(withAuthor)
                .where("comments.id", "=", id)
                .executeTakeFirst();

            // Return null if no comment is found, otherwise return the comment
            return comment ?? null;
        },

        /**
         * Finds all comments associated with a specific project ID.
         * @param projectId - The ID of the project to find comments for.
         * @returns An array of comments for the specified project.
         */
        async findByProjectId(projectId: number): Promise<CommentPublic[]> {
            return db
                .selectFrom("comments")
                .select(commentKeysPublic)
                .select(withAuthor)
                .where("projectId", "=", projectId)
                .orderBy("comments.id", "asc")
                .execute();
        },
        /**
         * Updates a comment by ID and returns the updated comment.
         * @param id - The ID of the comment to update.
         * @param data - The updated comment data.
         * @returns The updated comment.
         */
        async updateById(
            id: number,
            data: Updateable<Comments>
        ): Promise<CommentPublic> {
            return db
                .updateTable("comments")
                .set(data)
                .where("id", "=", id)
                .returning(commentKeysPublic)
                .returning(withAuthor)
                .executeTakeFirstOrThrow();
        },

        /**
         * Deletes a comment by ID.
         * @param id - The ID of the comment to delete.
         * @returns The ID of the deleted comment.
         */
        async deleteById(id: number): Promise<number> {
            return db
                .deleteFrom("comments")
                .where("id", "=", id)
                .returning("id")
                .executeTakeFirstOrThrow()
                .then((row) => row.id);
        },
    };
}

/**
 * Constructs a subquery to retrieve author details for comments.
 * @param eb - The expression builder instance.
 * @returns An expression builder with author details.
 */
function withAuthor(eb: ExpressionBuilder<DB, "comments">) {
    return jsonObjectFrom(
        eb
            .selectFrom("users")
            .select(userKeysPublic)
            .whereRef("users.id", "=", "comments.userId")
    ).as("author") as AliasedRawBuilder<UserPublic, "author">;
}

export type CommentRepository = ReturnType<typeof commentRepository>;
