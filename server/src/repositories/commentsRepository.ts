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
