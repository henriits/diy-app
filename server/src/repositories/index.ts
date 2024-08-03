import type { Database } from "@server/database";
import { usersRepository } from "./usersRepository";
import { projectRepository } from "./projectRepository";

export type RepositoryFactory = <T>(db: Database) => T;

const repositories = {
    usersRepository,
    projectRepository,
};

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
    [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};
export type RepositoriesKeys = keyof Repositories;

export { repositories };
