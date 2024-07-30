import "dotenv/config";
import createApp from "./app";
import { Pool } from "pg";

const { DATABASE_URL } = process.env;
const PORT = process.env.PORT || 3002;

if (!DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is not defined in the environment variables."
    );
}

// Create a new pool instance for connecting to PostgreSQL
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Set to true in production if using SSL
    },
});

const app = createApp(pool);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

console.log("This is the server");
