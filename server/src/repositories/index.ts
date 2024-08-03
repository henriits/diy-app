import type { Database } from "@server/database";
import { usersRepository } from "./usersRepository";
import { projectRepository } from "./projectRepository";
import { commentRepository } from "./commentsRepository";

export type RepositoryFactory = <T>(db: Database) => T;

const repositories = {
    usersRepository,
    projectRepository,
    commentRepository,
};

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
    [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};
export type RepositoriesKeys = keyof Repositories;

export { repositories };
