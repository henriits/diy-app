// src/app.ts
import express, { Application, Request, Response } from "express";
import { db } from "./database"; // Import the db instance
import { createUser, getUsers } from "../src/modules/users/controller";

const createApp = (database: typeof db): Application => {
    const app = express();

    // Middleware setup
    app.use(express.json());

    // Route to create a new user
    app.post("/users", createUser);

    // Route to get all users
    app.get("/users", getUsers);

    return app;
};

export default createApp;
