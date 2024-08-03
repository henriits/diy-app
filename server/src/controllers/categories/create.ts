import { categoriesRepository } from "@server/repositories/categoriesRepository";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { assertError } from "@server/utils/errors";
import {
    projectCategorySchema,
    type ProjectCategoryPublic,
} from "@server/entities/categories";

export default authenticatedProcedure
    .use(
        provideRepos({
            categoriesRepository,
        })
    )
    .input(
        projectCategorySchema.pick({
            name: true,
        })
    )
    .mutation(
        async ({
            input: category,
            ctx: { repos },
        }): Promise<ProjectCategoryPublic> => {
            try {
                // Attempt to create the project category
                const categoryCreated =
                    await repos.categoriesRepository.create(category);

                return categoryCreated;
            } catch (error: unknown) {
                assertError(error);
                console.error("Error details:", error);
                if (error.message.includes("unique_violation")) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Category with this name already exists.",
                        cause: error,
                    });
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An unexpected error occurred.",
                    cause: error,
                });
            }
        }
    );
