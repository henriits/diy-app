import { commentSchema, type CommentPublic } from "@server/entities/comments";
import provideRepos from "@server/trpc/provideRepos";
import { commentRepository } from "@server/repositories/commentsRepository";
import { publicProcedure } from "@server/trpc";
import { TRPCError } from "@trpc/server";

export default publicProcedure
    .use(
        provideRepos({
            commentRepository,
        })
    )
    .input(
        commentSchema.pick({
            id: true,
        })
    )
    .query(
        async ({ input: { id }, ctx: { repos } }): Promise<CommentPublic> => {
            const comment = await repos.commentRepository.findById(id);

            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Comment not found.",
                });
            }

            return comment;
        }
    );
