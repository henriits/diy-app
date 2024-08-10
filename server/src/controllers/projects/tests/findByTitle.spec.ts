import { describe, it, expect } from "vitest"; // Ensure you use the correct import based on your test framework
import { authContext } from "@server/tests/utils/context";
import { fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { createTestDatabase } from "@server/tests/utils/database";
import { createCallerFactory } from "@server/trpc";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { insertAll } from "@server/tests/utils/records";
import projectRouter from "..";

const createCaller = createCallerFactory(projectRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [user1, user2] = await insertAll(db, "users", [fakeUser(), fakeUser()]);

// Insert test projects with distinct titles
const [project1, project2] = await insertAll(db, "projects", [
    fakeProject({ userId: user1.id, title: "project alpha" }),
    fakeProject({ userId: user2.id, title: "beta project two" }),
]);

const { findByTitle } = createCaller(authContext({ db }, user1));

describe("findByTitle", () => {
    it("should return projects with matching title", async () => {
        const projectsResponse = await findByTitle({ title: "Project Alpha" });
        expect(projectsResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: project1.title }),
            ])
        );
    });

    it("should return an empty array if no projects match the title", async () => {
        const projectsResponse = await findByTitle({
            title: "Nonexistent Title",
        });
        expect(projectsResponse).toEqual([]);
    });

    it("should handle partial title matches", async () => {
        const projectsResponse = await findByTitle({ title: "Project" });
        expect(projectsResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ title: project1.title }),
                expect.objectContaining({ title: project2.title }),
            ])
        );
    });
});

it("should be case-insensitive", async () => {
    const projectsResponse = await findByTitle({ title: "beta" });
    expect(projectsResponse).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ title: project2.title }),
        ])
    );
});
