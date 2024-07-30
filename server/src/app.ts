import express, { Application, Request, Response } from "express";
import { Kysely } from "kysely";
import { DB } from "./database/types"; // Import your DB types
import bcrypt from "bcrypt";

const createApp = (database: Kysely<DB>): Application => {
    const app = express();

    // Middleware setup
    app.use(express.json());

    // Example route
    app.get("/", (req: Request, res: Response) => {
        res.send("Homepage");
        console.log("Hello from server");
    });

    // Example route with database interaction
    app.post("/users", async (req: Request, res: Response) => {
        const { name, email, password } = req.body;

        // Validate the request body, hash password, and create user
        try {
            // Add validation and password hashing logic here
            const hashedPassword = await bcrypt.hash(password, 10);

            const [user] = await database
                .insertInto("users")
                .values({ name, email, password: hashedPassword })
                .returning(["id", "name", "email"])
                .execute();

            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    return app;
};

export default createApp;
