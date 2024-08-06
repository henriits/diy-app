import { imageSchema, type ImagePublic } from "@server/entities/projectImages";
import { imageRepository } from "@server/repositories/imagesRepository";
import { projectRepository } from "@server/repositories/projectRepository";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { assertError } from "@server/utils/errors";

export default authenticatedProcedure
    .use(
        provideRepos({
            projectRepository,
            imageRepository,
        })
    )
    .input(
        imageSchema.pick({
            projectId: true,
            imageUrl: true,
        })
    )
    .mutation(
        async ({
            input: imageURL,
            ctx: { authUser, repos },
        }): Promise<ImagePublic> => {
            // Check if the project exists
            const project = await repos.projectRepository.findById(
                imageURL.projectId
            );

            if (!project) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found",
                });
            }

            try {
                // Attempt to add an image
                const imagesAdded = await repos.imageRepository.create({
                    ...imageURL,
                    userId: authUser.id,
                });

                return imagesAdded;
            } catch (error: unknown) {
                // Use the error assertion utility to handle known errors
                assertError(error);

                if (error.message.includes("23503")) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Referenced project not found.",
                        cause: error,
                    });
                }

                // Handle other potential database constraints or error cases
                if (error.message.includes("unique_violation")) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "Image already exists or a similar constraint violation.",
                        cause: error,
                    });
                }

                // Fallback for unexpected errors
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An unexpected error occurred.",
                    cause: error,
                });
            }
        }
    );
