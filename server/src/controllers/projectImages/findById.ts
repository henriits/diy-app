import { imageRepository } from "@server/repositories/imagesRepository";
import { imageSchema, type ImagePublic } from "@server/entities/projectImages";
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
    .query(async ({ input: { id }, ctx: { repos } }): Promise<ImagePublic> => {
        const image = await repos.imageRepository.findById(id);

        if (!image) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Image not found.",
            });
        }

        return image;
    });
