import { router } from "@server/trpc";
import users from "./users";
import projects from "./projects";

export const appRouter = router({
    users,
    projects,
});

export type AppRouter = typeof appRouter;
