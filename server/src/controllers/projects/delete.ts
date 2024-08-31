import { z } from "zod";
import { projectRepository } from "@server/repositories/projectRepository";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { TRPCError } from "@trpc/server";
import logger from "@server/utils/logger"; // Import the logger

export default authenticatedProcedure
    .use(provideRepos({ projectRepository }))
    .input(z.number().int().positive()) // Input is the project ID
    .mutation(async ({ input: id, ctx }) => {
        logger.debug(
            `User ${ctx.authUser?.id} is attempting to delete project with ID ${id}`
        );

        const existingProject = await ctx.repos.projectRepository.findById(id);

        if (!existingProject) {
            logger.warn(
                `Project with ID ${id} not found for user ${ctx.authUser?.id}`
            );
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            });
        }

        if (!ctx.authUser || existingProject.userId !== ctx.authUser.id) {
            logger.warn(
                `User ${ctx.authUser?.id} attempted to delete project ID ${id} but is unauthorized`
            );
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not allowed to delete this project",
            });
        }

        logger.info(
            `User ${ctx.authUser.id} is deleting project with ID ${id}`
        );
        await ctx.repos.projectRepository.delete(id);

        logger.info(
            `Project with ID ${id} successfully deleted by user ${ctx.authUser.id}`
        );
        return { success: true };
    });
