import { commentSchema, type CommentPublic } from "@server/entities/comments";
import { commentRepository } from "@server/repositories/commentsRepository";
import { projectRepository } from "@server/repositories/projectRepository";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { assertError } from "@server/utils/errors";

export default authenticatedProcedure
    .use(
        provideRepos({
            projectRepository,
            commentRepository,
        })
    )
    .input(
        commentSchema.pick({
            projectId: true,
            content: true,
        })
    )
    .mutation(
        async ({
            input: comment,
            ctx: { authUser, repos },
        }): Promise<CommentPublic> => {
            // Check if the project exists
            const project = await repos.projectRepository.findById(
                comment.projectId
            );

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            try {
                // Attempt to create the comment
                const commentCreated = await repos.commentRepository.create({
                    ...comment,
                    userId: authUser.id,
                });

                return commentCreated;
            } catch (error: unknown) {
                // Use the error assertion utility to handle known errors
                assertError(error);

                if (error.message.includes("23503")) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Referenced project not found.",
                        cause: error,
                    });
                }

                // Handle other potential database constraints or error cases
                if (error.message.includes("unique_violation")) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "Comment already exists or a similar constraint violation.",
                        cause: error,
                    });
                }

                // Fallback for unexpected errors
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An unexpected error occurred.",
                    cause: error,
                });
            }
        }
    );
