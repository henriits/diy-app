import { commentSchema, type CommentPublic } from "@server/entities/comments";
import provideRepos from "@server/trpc/provideRepos";
import { commentRepository } from "@server/repositories/commentsRepository";
import { publicProcedure } from "@server/trpc";

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

            return comments;
        }
    );
