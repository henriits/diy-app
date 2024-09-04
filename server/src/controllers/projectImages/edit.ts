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
            imageUrl: true,
        })
    )
    .mutation(async ({ input, ctx: { repos } }) => {
        // Fetch the image by ID
        const image = await repos.imageRepository.findById(input.id);

        // If image doesn't exist, throw a NOT_FOUND error
        if (!image) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Image not found.",
            });
        }

        // Update the image's content
        const updatedImage = await repos.imageRepository.updateById(input.id, {
            imageUrl: input.imageUrl,
        });

        // Return the updated comment
        return updatedImage;
    });
