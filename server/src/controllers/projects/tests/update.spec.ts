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

const { update: updateProject } = createCaller(authContext({ db }, user));

it("should update a project successfully", async () => {
    const updatedData = {
        title: "Updated Title",
        description: "Updated Description",
    };

    const updatedProject = await updateProject({
        id: project.id,
        data: updatedData,
    });

    // Ensure updatedProject is defined before using it
    if (updatedProject) {
        expect(updatedProject).toMatchObject({
            id: project.id,
            ...updatedData,
        });

        const [projectFromDb] = await selectAll(db, "projects", (eb) =>
            eb("id", "=", project.id)
        );

        expect(projectFromDb).toMatchObject(updatedProject);
    } else {
        // Handle the case where updatedProject is undefined
        throw new Error("Update failed, project not found");
    }
});

it("should throw an error if the project does not exist", async () => {
    const nonExistId = project.id + 1; // Use a non-existing ID
    const updatedData = { title: "Updated Title" };

    await expect(
        updateProject({
            id: nonExistId,
            data: updatedData,
        })
    ).rejects.toThrowError(/not found/i);
});

it("should throw an error if the user is not authorized to update the project", async () => {
    const [anotherUser] = await insertAll(db, "users", fakeUser());
    const { update: updateAnotherProject } = createCaller(
        authContext({ db }, anotherUser)
    );

    const updatedData = { title: "Updated Title" };

    await expect(
        updateAnotherProject({
            id: project.id,
            data: updatedData,
        })
    ).rejects.toThrowError(/not allowed/i);
});
