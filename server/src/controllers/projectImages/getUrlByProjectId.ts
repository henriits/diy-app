import { imageRepository } from "@server/repositories/imagesRepository";
import { imageSchema } from "@server/entities/projectImages";
import provideRepos from "@server/trpc/provideRepos";
import { publicProcedure } from "@server/trpc";

export default publicProcedure
    .use(
        provideRepos({
            imageRepository,
        })
    )
    .input(
        imageSchema.pick({
            projectId: true,
        })
    )
    .query(async ({ input: { projectId }, ctx: { repos } }) => {
        const imageUrl =
            await repos.imageRepository.getImageUrlByProjectId(projectId);

        return imageUrl;
    });
