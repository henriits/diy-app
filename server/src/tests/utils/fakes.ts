import type { Users, Projects } from "@server/database/types";
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
