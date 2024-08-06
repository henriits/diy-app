import type {
    Users,
    Projects,
    Comments,
    ProjectCategories,
    Ratings,
    ProjectImages,
} from "@server/database/types";
import type { Insertable } from "kysely";
import type { AuthUser } from "@server/entities/users";
import { random } from "./random";

const randomId = () =>
    random.integer({
        min: 1,
        max: 1000000,
    });

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<Users>>>(
    overrides: T = {} as T
) =>
    ({
        firstName: random.first().trim().toLowerCase(),
        lastName: random.last().trim().toLowerCase(),
        email: random.email().trim().toLowerCase(),
        password: "Password.123!",
        username: random.last().trim().toLowerCase(),
        ...overrides,
    }) satisfies Insertable<Users>;

export const fakeAuthUser = <T extends Partial<AuthUser>>(
    overrides: T = {} as T
): AuthUser => ({
    id: randomId(),
    isAdmin: false,
    ...overrides,
});

export const fakeAdminUser = <T extends Partial<AuthUser>>(
    overrides: T = {} as T
): AuthUser => ({
    id: randomId(),
    isAdmin: true,
    ...overrides,
});

/**
 * Generates a fake project with some default test data.
 * @param overrides userId and any properties that should be different from default fake data.
 */
export const fakeProject = <T extends Partial<Insertable<Projects>>>(
    overrides: T
) =>
    ({
        title: random.string(),
        description: random.string(),
        instructions: random.paragraph(),
        materials: random.string(),
        userId: randomId(),
        ...overrides,
    }) satisfies Insertable<Projects>;

/**
 * Generates a fake comment with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeComment = <T extends Partial<Insertable<Comments>>>(
    overrides: T = {} as T
) =>
    ({
        projectId: randomId(),
        userId: randomId(),
        content: random.paragraph(),
        ...overrides,
    }) satisfies Insertable<Comments>;

/**
 * Generates a fake project category with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeProjectCategory = <
    T extends Partial<Insertable<ProjectCategories>>,
>(
    overrides: T = {} as T
) =>
    ({
        name: random.word().trim().toLowerCase(),
        ...overrides,
    }) satisfies Insertable<ProjectCategories>;

/**
 * Generates a fake project rating with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */

export const fakeRating = <T extends Partial<Insertable<Ratings>>>(
    overrides: T = {} as T
) =>
    ({
        userId: randomId(),
        projectId: randomId(),
        rating: random.integer({ min: 1, max: 5 }),
        ...overrides,
    }) satisfies Insertable<Ratings>;

/**
 * Generates a fake project images with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */

export const fakeImage = <T extends Partial<Insertable<ProjectImages>>>(
    overrides: T = {} as T
) =>
    ({
        userId: randomId(),
        projectId: randomId(),
        imageUrl: "https://www.example.com",
        ...overrides,
    }) satisfies Insertable<ProjectImages>;
