import { authContext } from "@server/tests/utils/context";
import { fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { createTestDatabase } from "@server/tests/utils/database";
import { createCallerFactory } from "@server/trpc";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { insertAll, selectAll } from "@server/tests/utils/records";
import projectRouter from "..";

const createCaller = createCallerFactory(projectRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(db, "users", fakeUser());
const [project] = await insertAll(db, "projects", [
    fakeProject({ userId: user.id }),
]);

const { delete: deleteProject } = createCaller(authContext({ db }, user));

it("should delete a project successfully", async () => {
    await deleteProject(project.id);

    const deletedProject = await selectAll(db, "projects", (eb) =>
        eb("id", "=", project.id)
    );

    expect(deletedProject).toHaveLength(0); // Verify the project was deleted
});

it("should throw an error if the project does not exist", async () => {
    const nonExistId = project.id + 1; // Use a non-existing ID
    await expect(deleteProject(nonExistId)).rejects.toThrowError(/not found/i);
});

it("should throw an error if the user is not authorized to delete the project", async () => {
    const [anotherUser] = await insertAll(db, "users", fakeUser());
    const { delete: deleteAnotherProject } = createCaller(
        authContext({ db }, anotherUser)
    );

    await expect(deleteAnotherProject(project.id)).rejects.toThrowError(
        /not allowed/i
    );
});
