import { idSchema } from "@server/entities/shared";
import { projectRepository } from "@server/repositories/projectRepository";
import { publicProcedure } from "@server/trpc";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";

export default publicProcedure
    .use(
        provideRepos({
            projectRepository,
        })
    )
    .input(idSchema)
    .query(async ({ input: projectId, ctx: { repos } }) => {
        const article = await repos.projectRepository.findById(projectId);

        if (!article) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Article was not found",
            });
        }

        return article;
    });
