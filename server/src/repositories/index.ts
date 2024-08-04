import type { Database } from "@server/database";
import { usersRepository } from "./usersRepository";
import { projectRepository } from "./projectRepository";
import { commentRepository } from "./commentsRepository";
import { categoriesRepository } from "./categoriesRepository";
import { projectCategoryAssignmentsRepository } from "./projectCategoryAssignmentsRepository";

export type RepositoryFactory = <T>(db: Database) => T;

const repositories = {
    usersRepository,
    projectRepository,
    commentRepository,
    categoriesRepository,
    projectCategoryAssignmentsRepository,
};

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
    [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};
export type RepositoriesKeys = keyof Repositories;

export { repositories };
