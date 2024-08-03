import { router } from "@server/trpc";
import users from "./users";
import projects from "./projects";
import comments from "./comments";

export const appRouter = router({
    users,
    projects,
    comments,
});

export type AppRouter = typeof appRouter;
