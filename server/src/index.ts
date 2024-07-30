import "dotenv/config";
import createApp from "./app";
import { db } from "./database"; // Import the db instance

const PORT = process.env.PORT || 3002;

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is not defined in the environment variables."
    );
}

const app = createApp(db);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

console.log("This is the server");
