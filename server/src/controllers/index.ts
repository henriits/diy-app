import { router } from "@server/trpc";
import users from "./users";
import projects from "./projects";
import comments from "./comments";
import categories from "./categories";
import categoryAssignment from "./categoryAssignment";
import ratings from "./ratings";
import projectImages from "./projectImages";

export const appRouter = router({
    users,
    projects,
    comments,
    categories,
    categoryAssignment,
    ratings,
    projectImages,
});
