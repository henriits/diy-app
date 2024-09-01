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

const [project1, project2, project3] = await insertAll(db, "projects", [
    fakeProject({ userId: user1.id }),
    fakeProject({ userId: user1.id }), // Another project for user1
    fakeProject({ userId: user2.id }), // Project for user2
]);

const { findByUser } = createCaller(authContext({ db }, user1));

describe("findByUser", () => {
    it("should return projects for the authenticated user", async () => {
        const projectsResponse = await findByUser({ userId: user1.id }); // Pass an object with userId
        expect(projectsResponse).toHaveLength(2); // Expecting 2 projects for user1
        expect(projectsResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: project1.id, userId: user1.id }),
                expect.objectContaining({ id: project2.id, userId: user1.id }),
            ])
        );
    });

    it("should return an empty array if the user has no projects", async () => {
        const projectsResponse = await findByUser({ userId: user2.id }); // Pass an object with userId
        expect(projectsResponse).toHaveLength(1);
        expect(projectsResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: project3.id, userId: user2.id }),
            ])
        );
    });
});
