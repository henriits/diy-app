import { authContext, requestContext } from "@server/tests/utils/context";
import { fakeUser } from "@server/tests/utils/fakes";
import { createTestDatabase } from "@server/tests/utils/database";
import { createCallerFactory } from "@server/trpc";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import projectRouter from "..";
import { insertAll, selectAll } from "../../../tests/utils/records";

const createCaller = createCallerFactory(projectRouter);
const db = await wrapInRollbacks(createTestDatabase());

it("should throw an error if user is not authenticated", async () => {
    const { create } = createCaller(requestContext({ db }));

    await expect(
        create({
            title: "title",
            description: "description",
            instructions: "instruction",
            materials: "materials",
        })
    ).rejects.toThrow(/unauthenticated/i);
});

it("should create a persisted project", async () => {
    const [user] = await insertAll(db, "users", fakeUser());
    const { create } = createCaller(authContext({ db }, user));

    const projectReturned = await create({
        title: "title",
        description: "description",
        instructions: "instruction",
        materials: "materials",
    });
    expect(projectReturned).toMatchObject({
        id: expect.any(Number),
        title: "title",
        description: "description",
        instructions: "instruction",
        materials: "materials",
    });

    const [projectCreated] = await selectAll(db, "projects", (eb) =>
        eb("id", "=", projectReturned.id)
    );
    expect(projectCreated).toMatchObject(projectReturned);
});
