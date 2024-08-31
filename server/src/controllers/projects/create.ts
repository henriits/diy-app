import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import provideRepos from "@server/trpc/provideRepos";
import { projectRepository } from "@server/repositories/projectRepository";
import logger from "@server/utils/logger";
import { projectSchema } from "../../entities/projects";

export default authenticatedProcedure
    .use(provideRepos({ projectRepository }))

    .input(
        projectSchema.pick({
            title: true,
            description: true,
            instructions: true,
            materials: true,
        })
    )
    .mutation(async ({ input: projectData, ctx: { authUser, repos } }) => {
        const project = {
            ...projectData,
            userId: authUser.id,
        };
        const projectCreated = await repos.projectRepository.create(project);
        logger.info(`Project Created By User id ${project.userId}`);
        return projectCreated;
    });
