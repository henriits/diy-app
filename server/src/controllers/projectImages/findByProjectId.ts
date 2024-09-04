import { imageRepository } from "@server/repositories/imagesRepository";
import { imageSchema, type ImagePublic } from "@server/entities/projectImages";
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
    .query(
        async ({
            input: { projectId },
            ctx: { repos },
        }): Promise<ImagePublic[]> => {
            const image =
                await repos.imageRepository.findByProjectId(projectId);

            return image;
            // return images[0]; // Return the first image
        }
    );
