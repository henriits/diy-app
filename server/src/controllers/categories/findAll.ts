import { categoriesRepository } from "@server/repositories/categoriesRepository";
import provideRepos from "@server/trpc/provideRepos";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import type { ProjectCategoryPublic } from "@server/entities/categories";
import { TRPCError } from "@trpc/server";

export default authenticatedProcedure
    .use(
        provideRepos({
            categoriesRepository,
        })
    )
    .query(async ({ ctx: { repos } }): Promise<ProjectCategoryPublic[]> => {
        try {
            // Fetch all categories from the repository
            const categories = await repos.categoriesRepository.findAll();
            return categories;
        } catch (error) {
            console.error("Error details:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred.",
                cause: error,
            });
        }
    });
