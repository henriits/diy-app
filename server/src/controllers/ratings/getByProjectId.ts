import provideRepos from "@server/trpc/provideRepos";
import { ratingsRepository } from "@server/repositories/ratingsRepository";
import { publicProcedure } from "@server/trpc";
import { ratingSchema, type RatingPublic } from "../../entities/ratings";

export default publicProcedure
    .use(
        provideRepos({
            ratingsRepository,
        })
    )
    .input(
        ratingSchema.pick({
            projectId: true,
        })
    )
    .query(
        async ({
            input: { projectId },
            ctx: { repos },
        }): Promise<RatingPublic[]> => {
            const rating =
                await repos.ratingsRepository.findByProjectId(projectId);

            return rating;
        }
    );
