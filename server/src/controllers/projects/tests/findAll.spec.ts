import { fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { createTestDatabase } from "@server/tests/utils/database";
import { createCallerFactory } from "@server/trpc";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { clearTables, insertAll } from "@server/tests/utils/records";
import projectRouter from "..";

const createCaller = createCallerFactory(projectRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ["projects"]);
const [user] = await insertAll(db, "users", fakeUser());

const { findAll } = createCaller({ db });

it("should return an empty list, if there are no articles", async () => {
    expect(await findAll()).toHaveLength(0);
});

it("should return a list of projects", async () => {
    await insertAll(db, "projects", [
        fakeProject({ userId: user.id }),
        fakeProject({ userId: user.id }),
        fakeProject({ userId: user.id }),
    ]);
    const projects = await findAll();
    expect(projects).toHaveLength(3);
});

it("should return the latest project first", async () => {
    const [oldProject] = await insertAll(db, "projects", [
        fakeProject({ userId: user.id }),
    ]);
    const [newProject] = await insertAll(db, "projects", [
        fakeProject({ userId: user.id }),
    ]);
    const projects = await findAll();

    expect(projects[0]).toMatchObject(newProject);
    expect(projects[1]).toMatchObject(oldProject);
});
