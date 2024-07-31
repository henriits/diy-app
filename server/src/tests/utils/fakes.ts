import type { Users } from "@server/database/types";
import type { Insertable } from "kysely";
import { random } from "./random";

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<Users>>>(
    overrides: T = {} as T
) =>
    ({
        firstName: random.name().trim().toLowerCase(),
        lastName: random.name().trim().toLowerCase(),
        email: random.email().trim().toLowerCase(),
        password: "Password.123!",
        username: random.first().trim().toLowerCase(),
        ...overrides,
    }) satisfies Insertable<Users>;
