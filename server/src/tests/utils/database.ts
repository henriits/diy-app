import config from "@server/config";
import { createDatabase } from "@server/database";

export const createTestDatabase = () => {
    if (!config.testDatabase) {
        console.warn("Test database configuration is not provided.");
        return undefined;
    }

    return createDatabase(config.testDatabase);
};
