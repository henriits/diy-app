import { z } from "zod";
import { projectSchema } from "@server/entities/projects";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import { projectRepository } from "@server/repositories/projectRepository";
import logger from "@server/utils/logger"; // Import the logger

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
            logger.warn("Unauthorized access attempt detected");
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not authenticated",
            });
        }

        logger.debug(
            `User ${ctx.authUser.id} is attempting to update project with ID ${id}`
        );

        // Fetch the existing project
        const existingProject = await ctx.repos.projectRepository.findById(id);

        if (!existingProject) {
            logger.warn(
                `Project with ID ${id} not found for user ${ctx.authUser.id}`
            );
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            });
        }

        // Ensure correct type comparison
        if (existingProject.userId !== ctx.authUser.id) {
            logger.warn(
                `User ${ctx.authUser.id} attempted to update project ID ${id} but is unauthorized`
            );
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not allowed to update this project",
            });
        }

        logger.info(
            `User ${ctx.authUser.id} is updating project with ID ${id}`
        );

        // Perform the update
        const updatedProject = await ctx.repos.projectRepository.update(
            id,
            data
        );

        logger.info(
            `Project with ID ${id} successfully updated by user ${ctx.authUser.id}`
        );
        return updatedProject;
    });
