import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcrypt";

describe("bcrypt", () => {
    const password = "securepassword";
    let hashedPassword: string;

    beforeAll(async () => {
        // Hash the password before running tests
        hashedPassword = await bcrypt.hash(password, 10);
    });

    it("should hash a password", async () => {
        expect(hashedPassword).not.toBe(password);
    });

    it("should match the hashed password with the original password", async () => {
        const match = await bcrypt.compare(password, hashedPassword);
        expect(match).toBe(true);
    });

    it("should not match an incorrect password", async () => {
        const match = await bcrypt.compare("wrongpassword", hashedPassword);
        expect(match).toBe(false);
    });
    it("should start with $2b$10", () => {
        // Check if the hashed password starts with $2b$10
        expect(hashedPassword).toMatch(/^\$2b\$10/);
    });

    it("should contain a valid bcrypt hash prefix", () => {
        // Check if the hashed password contains $2b$10
        expect(hashedPassword).toContain("$2b$10");
    });
});
