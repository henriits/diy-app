// server/src/controllers/projects/findByUser.ts

import { publicProcedure } from "@server/trpc";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import { projectRepository } from "@server/repositories/projectRepository";
import { z } from "zod";

export default publicProcedure
    .use(
        provideRepos({
            projectRepository,
        })
    )
    .input(z.object({ userId: z.number() })) // Ensure input is defined correctly
    .query(async ({ input, ctx }) => {
        const { userId } = input;

        if (!userId) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User not authenticated",
            });
        }

        // Fetch projects for the authenticated user
        return ctx.repos.projectRepository.findByUser(userId);
    });
