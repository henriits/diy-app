import { todo } from "node:test";
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

const [project1, project2] = await insertAll(db, "projects", [
    fakeProject({ userId: user1.id }),
    fakeProject({ userId: user2.id }),
]);

const { get } = createCaller(authContext({ db }, user1));

it("should return a project", async () => {
    const projectResponse = await get(project1.id);
    expect(projectResponse).toMatchObject(project1);
});

it("should throw an error if article does not exist", async () => {
    const nonExistId = project1.id + project2.id;
    await expect(get(nonExistId)).rejects.toThrowError(/not found/i);
});

todo("Find project by title or description");
