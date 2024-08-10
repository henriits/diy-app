import { z } from "zod";
import { projectRepository } from "@server/repositories/projectRepository";
import { publicProcedure } from "@server/trpc";
import provideRepos from "@server/trpc/provideRepos";

// Define the input schema for title
const titleSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").trim().toLowerCase(),
});

export default publicProcedure
    .use(
        provideRepos({
            projectRepository,
        })
    )
    .input(titleSchema)
    .query(async ({ input: { title }, ctx: { repos } }) => {
        const projects = await repos.projectRepository.findByTitle(title);

        // Return an empty array if no projects found
        if (projects.length === 0) {
            return [];
        }

        return projects;
    });
