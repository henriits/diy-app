// src/controllers/userController.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../../database"; // Ensure db is exported and imported correctly
import { userSchema } from "./schema";

const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt

export const createUser = async (req: Request, res: Response) => {
    const validation = userSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
    }

    const { name, email, password } = validation.data;

    try {
        // Log the plain password
        console.log("plain password", password);
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        // Log the hashed password
        console.log("Hashed password:", hashedPassword);

        const [user] = await db
            .insertInto("users")
            .values({ name, email, password: hashedPassword })
            .returning(["id", "name", "email"])
            .execute();
        // Log the user object
        console.log("Created user:", user);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// how to test this out, console log hash and password etc
// Get all users
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await db
            .selectFrom("users")
            .select(["id", "name", "email"])
            .execute();

        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
