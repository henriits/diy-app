// controller/categoryAssignments.ts

import { projectCategoryAssignmentsRepository } from "@server/repositories/projectCategoryAssignmentsRepository";
import provideRepos from "@server/trpc/provideRepos";
import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { TRPCError } from "@trpc/server";
import {
    createProjectCategoryAssignmentSchema,
    type ProjectCategoryAssignmentPublic,
} from "@server/entities/projectCategoryAssignments";

export default authenticatedProcedure
    .use(
        provideRepos({
            projectCategoryAssignmentsRepository,
        })
    )
    .input(createProjectCategoryAssignmentSchema)
    .mutation(
        async ({
            input: assignment,
            ctx: { repos },
        }): Promise<ProjectCategoryAssignmentPublic> => {
            const { projectId, categoryId } = assignment;
            try {
                const projectExists =
                    await repos.projectCategoryAssignmentsRepository.projectExists(
                        projectId
                    );
                if (!projectExists) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Project with ID ${projectId} not found`,
                    });
                }

                const categoryExists =
                    await repos.projectCategoryAssignmentsRepository.categoryExists(
                        categoryId
                    );
                if (!categoryExists) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `Category with ID ${categoryId} not found`,
                    });
                }

                const assignmentExists =
                    await repos.projectCategoryAssignmentsRepository.assignmentExists(
                        projectId,
                        categoryId
                    );
                if (assignmentExists) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: `Assignment for project ID ${projectId} and category ID ${categoryId} already exists`,
                    });
                }

                const assignmentCreated =
                    await repos.projectCategoryAssignmentsRepository.create(
                        assignment
                    );

                return assignmentCreated;
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        "An unexpected error occurred while creating category assignment.",
                    cause: error,
                });
            }
        }
    );
