import { imageRepository } from "@server/repositories/imagesRepository";
import { imageSchema } from "@server/entities/projectImages";
import provideRepos from "@server/trpc/provideRepos";
import { publicProcedure } from "@server/trpc";
import { TRPCError } from "@trpc/server";

export default publicProcedure
    .use(
        provideRepos({
            imageRepository,
        })
    )
    .input(
        imageSchema.pick({
            id: true,
        })
    )
    .query(async ({ input: { id }, ctx: { repos } }) => {
        const imageUrl = await repos.imageRepository.getImageUrlById(id);

        if (!imageUrl) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Image not found.",
            });
        }

        return imageUrl;
    });
