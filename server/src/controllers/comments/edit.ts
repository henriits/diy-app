// server/src/comments/edit.ts

import { commentSchema } from "@server/entities/comments";
import { commentRepository } from "@server/repositories/commentsRepository";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";

export default authenticatedProcedure
    .use(
        provideRepos({
            commentRepository,
        })
    )
    .input(
        commentSchema.pick({
            id: true,
            content: true,
        })
    )
    .mutation(async ({ input, ctx: { authUser, repos } }) => {
        // Fetch the comment by ID
        const comment = await repos.commentRepository.findById(input.id);

        // If comment doesn't exist, throw a NOT_FOUND error
        if (!comment) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Comment not found.",
            });
        }

        // If the logged-in user is not the author of the comment, throw a FORBIDDEN error
        if (comment.userId !== authUser.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not authorized to edit this comment.",
            });
        }

        // Update the comment's content
        const updatedComment = await repos.commentRepository.updateById(
            input.id,
            { content: input.content }
        );

        // Return the updated comment
        return updatedComment;
    });
