import express, { Application, Request, Response } from "express";
import { Pool } from "pg";

const createApp = (database: Pool): Application => {
    const app = express();

    // Middleware setup, e.g., bodyParser, cors, etc.
    app.use(express.json());
    // Example route
    app.get("/", (req: Request, res: Response) => {
        res.send("Homepage");
        console.log("Hello from server");
    });

    // Example route with database interaction
    app.get("/users", async (req: Request, res: Response) => {
        try {
            const { rows } = await database.query("SELECT * FROM users");
            res.json(rows);
        } catch (err) {
            res.status(500).send("Error");
        }
    });

    return app;
};

export default createApp;
