import createApp from "./app";
import { createDatabase } from "./database";
import config from "./config";
import logger from "./utils/logger";

const database = createDatabase(config.database);
const app = createApp(database);

app.listen(config.port, () => {
    logger.info(`Server is running at http://localhost:${config.port}`);
});

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is not defined in the environment variables."
    );
}
