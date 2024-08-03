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
            projectId: true,
        })
    )
    .query(
        async ({
            input: { projectId },
            ctx: { repos },
        }): Promise<CommentPublic[]> => {
            const comments =
                await repos.commentRepository.findByProjectId(projectId);

            if (comments.length === 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No comments found for the given projectId",
                });
            }

            return comments;
        }
    );
