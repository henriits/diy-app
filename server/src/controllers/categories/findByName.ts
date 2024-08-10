import { z } from "zod";
import { categoriesRepository } from "@server/repositories/categoriesRepository";
import { publicProcedure } from "@server/trpc";
import provideRepos from "@server/trpc/provideRepos";

// Define the input schema for title
const nameSchema = z.object({
    name: z.string().min(1, "Title cannot be empty").trim().toLowerCase(),
});

export default publicProcedure
    .use(
        provideRepos({
            categoriesRepository,
        })
    )
    .input(nameSchema)
    .query(async ({ input: { name }, ctx: { repos } }) => {
        const projects = await repos.categoriesRepository.findByName(name);

        // Return an empty array if no projects found
        if (projects.length === 0) {
            return [];
        }

        return projects;
    });
