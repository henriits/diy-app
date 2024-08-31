import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { ratingsRepository } from "@server/repositories/ratingsRepository";
import logger from "@server/utils/logger";
import { createRatingSchema } from "../../entities/ratings";

export default authenticatedProcedure
    .use(provideRepos({ ratingsRepository }))
    .input(createRatingSchema)
    .mutation(async ({ input, ctx: { authUser, repos } }) => {
        const { rating, projectId } = input;

        const ratingDataWithUser = {
            rating,
            projectId,
            userId: authUser.id,
        };

        const ratingCreated =
            await repos.ratingsRepository.create(ratingDataWithUser);
        logger.info(
            `Rating created: (Rating: ${rating},  Project id : ${projectId})`
        );
        return ratingCreated;
    });
