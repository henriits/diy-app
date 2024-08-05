import { z } from "zod";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { ratingsRepository } from "@server/repositories/ratingsRepository";

const deleteRating = authenticatedProcedure
    .use(provideRepos({ ratingsRepository }))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx: { authUser, repos } }) => {
        const { id } = input;

        // Fetch the rating to ensure it exists and belongs to the authenticated user
        const ratingToDelete = await repos.ratingsRepository.findById(id);

        if (!ratingToDelete) {
            throw new Error("Rating not found");
        }

        if (ratingToDelete.userId !== authUser.id) {
            throw new Error("Unauthorized");
        }

        await repos.ratingsRepository.delete(id);

        return { success: true };
    });

export default deleteRating;
