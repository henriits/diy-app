// src/app.ts
import express from "express";
import { createUser, getUsers } from "./modules/users/controller";
import type { Database } from "./database";

export default function createApp(db: Database) {
    const app = express();

    // Middleware setup
    app.use(express.json());

    // Route to create a new user
    app.post("/users", createUser);

    // Route to get all users
    app.get("/users", getUsers);
    return app;
}
