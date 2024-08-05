import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { ratingsRepository } from "@server/repositories/ratingsRepository";
import { z } from "zod";

export default authenticatedProcedure
    .use(provideRepos({ ratingsRepository }))
    .input(
        z.object({
            id: z.number(),
            rating: z.number(),
        })
    )
    .mutation(async ({ input, ctx: { authUser, repos } }) => {
        const { id, rating } = input;

        const ratingToUpdate = await repos.ratingsRepository.update(id, {
            userId: authUser.id,
            rating,
        });

        if (!ratingToUpdate) {
            throw new Error("Rating not found");
        }

        return ratingToUpdate;
    });
