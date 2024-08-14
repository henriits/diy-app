import { z } from "zod";
import { projectSchema } from "@server/entities/projects";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import { projectRepository } from "@server/repositories/projectRepository";

export default authenticatedProcedure
    .use(provideRepos({ projectRepository }))
    .input(
        z.object({
            id: z.number().int().positive(),
            data: projectSchema.partial().omit({ userId: true }),
        })
    )
    .mutation(async ({ input: { id, data }, ctx }) => {
        if (!ctx.authUser) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not authenticated",
            });
        }

        // Fetch the existing project
        const existingProject = await ctx.repos.projectRepository.findById(id);

        if (!existingProject) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            });
        }

        // Ensure correct type comparison
        if (existingProject.userId !== ctx.authUser.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not allowed to update this project",
            });
        }

        // Perform the update
        const updatedProject = await ctx.repos.projectRepository.update(
            id,
            data
        );
        return updatedProject;
    });
