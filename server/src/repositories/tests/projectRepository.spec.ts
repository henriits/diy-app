import { createTestDatabase } from "@server/tests/utils/database";
import { fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { insertAll } from "@server/tests/utils/records";
import { pick } from "lodash-es";
import { projectKeysPublic } from "@server/entities/projects";
import { projectRepository } from "../projectRepository";

const db = await wrapInRollbacks(createTestDatabase());
const repository = projectRepository(db);

describe("create", () => {
    it("should create a new project", async () => {
        // Create a user first
        const [user] = await insertAll(db, "users", fakeUser());
        // Create a project with the valid user id
        const project = fakeProject({ userId: user.id });

        // Insert the project and verify its creation
        const createdProject = await repository.create(project);

        expect(createdProject).toEqual({
            id: expect.any(Number),
            ...pick(project, projectKeysPublic),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});

describe("getAll", () => {
    it("should get all projects", async () => {
        // Create a user first
        const [user] = await insertAll(db, "users", [fakeUser()]);

        // Insert multiple projects with the valid user id
        await insertAll(db, "projects", [
            fakeProject({ userId: user.id, title: "Project 1" }),
            fakeProject({ userId: user.id, title: "Project 2" }),
            fakeProject({ userId: user.id, title: "Project 3" }),
        ]);

        const allProjects = await repository.findAll({ offset: 0, limit: 10 });

        expect(allProjects).toHaveLength(3); // Adjust if you have different number of projects
    });
});

describe("hasUserId", () => {
    it("should return true if the project belongs to the given user", async () => {
        // Create a user
        const [user] = await insertAll(db, "users", [fakeUser()]);

        // Create a project with the valid user id
        const [project] = await insertAll(db, "projects", [
            fakeProject({ userId: user.id }),
        ]);

        // Verify that hasUserId returns true for the correct user
        const result = await repository.hasUserId(project.id, user.id);
        expect(result).toBe(true);
    });

    it("should return false if the project does not belong to the given user", async () => {
        // Create two users
        const [user1] = await insertAll(db, "users", [fakeUser()]);
        const [user2] = await insertAll(db, "users", [fakeUser()]);

        // Create a project with the first user id
        const [project] = await insertAll(db, "projects", [
            fakeProject({ userId: user1.id }),
        ]);

        // Verify that hasUserId returns false for a different user
        const result = await repository.hasUserId(project.id, user2.id);
        expect(result).toBe(false);
    });

    it("should return false if the project does not exist", async () => {
        // Create a user
        const [user] = await insertAll(db, "users", [fakeUser()]);

        // Verify that hasUserId returns false for a non-existing project
        const result = await repository.hasUserId(9999, user.id); // Assuming 9999 does not exist
        expect(result).toBe(false);
    });
});
describe("delete", () => {
    it("should delete a project by id", async () => {
        // Create a user and a project
        const [user] = await insertAll(db, "users", [fakeUser()]);
        const [project] = await insertAll(db, "projects", [
            fakeProject({ userId: user.id }),
        ]);

        // Delete the project
        await repository.delete(project.id);

        // Verify the project was deleted
        const deletedProject = await db
            .selectFrom("projects")
            .select(["id"])
            .where("id", "=", project.id)
            .executeTakeFirst();

        expect(deletedProject).toBeUndefined();
    });

    it("should not throw an error if trying to delete a non-existent project", async () => {
        // Attempt to delete a project with a non-existent id
        await expect(repository.delete(9999)).resolves.not.toThrow();
    });
});
describe("update", () => {
    it("should update a project by id", async () => {
        // Create a user and a project
        const [user] = await insertAll(db, "users", [fakeUser()]);
        const [project] = await insertAll(db, "projects", [
            fakeProject({ userId: user.id }),
        ]);

        // Define updated data
        const updatedData = {
            title: "Updated Title",
            description: "Updated Description",
        };

        // Update the project
        const updatedProject = await repository.update(project.id, updatedData);

        // Verify the project was updated
        expect(updatedProject).toEqual({
            id: project.id,
            ...updatedData,
            materials: project.materials,
            instructions: project.instructions,
            userId: project.userId,
            createdAt: project.createdAt,
            updatedAt: expect.any(Date),
        });

        // Fetch the project to verify update in the database
        const fetchedProject = await db
            .selectFrom("projects")
            .select(projectKeysPublic)
            .where("id", "=", project.id)
            .executeTakeFirst();

        expect(fetchedProject).toEqual({
            id: project.id,
            ...updatedData,
            materials: project.materials,
            instructions: project.instructions,
            userId: project.userId,
            createdAt: project.createdAt,
            updatedAt: expect.any(Date),
        });
    });

    it("should return undefined if project does not exist", async () => {
        // Attempt to update a project with a non-existent id
        const result = await repository.update(9999, { title: "Non-existent" });
        expect(result).toBeUndefined();
    });
});

describe("getById", () => {
    it("should retrieve a project by id", async () => {
        // Create a user and a project
        const [user] = await insertAll(db, "users", [fakeUser()]);
        const [project] = await insertAll(db, "projects", [
            fakeProject({ userId: user.id }),
        ]);

        // Retrieve the project by id
        const fetchedProject = await repository.findById(project.id);

        // Verify the retrieved project
        expect(fetchedProject).toEqual({
            id: project.id,
            title: project.title,
            description: project.description,
            instructions: project.instructions,
            materials: project.materials,
            userId: project.userId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            username: user.username,
        });
    });

    it("should return undefined if project does not exist", async () => {
        // Attempt to retrieve a project with a non-existent id
        const result = await repository.findById(9999);
        expect(result).toBeUndefined();
    });
});
