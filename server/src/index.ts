import createApp from "./app";
import { createDatabase } from "./database";
import config from "./config";

const database = createDatabase(config.database);
const app = createApp(database);

app.listen(config.port, () => {
    console.log(`Server is running at http://localhost:${config.port}`);
});

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is not defined in the environment variables."
    );
}

console.log("This is the server");
