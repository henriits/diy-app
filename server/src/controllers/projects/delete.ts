import { z } from "zod";
import { projectRepository } from "@server/repositories/projectRepository";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";

export default authenticatedProcedure
    .use(provideRepos({ projectRepository }))
    .input(z.number().int().positive()) // Input is the project ID
    .mutation(async ({ input: id, ctx }) => {
        const existingProject = await ctx.repos.projectRepository.findById(id);

        if (!existingProject) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            });
        }

        if (!ctx.authUser || existingProject.userId !== ctx.authUser.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not allowed to delete this project",
            });
        }

        await ctx.repos.projectRepository.delete(id);
        return { success: true };
    });
