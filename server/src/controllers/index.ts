import { router } from "@server/trpc";
import users from "./users";
import projects from "./projects";
import comments from "./comments";
import categories from "./categories";

export const appRouter = router({
    users,
    projects,
    comments,
    categories,
});

export type AppRouter = typeof appRouter;
