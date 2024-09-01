import { createCallerFactory } from "@server/trpc";
import { authContext } from "@server/tests/utils/context";
import { fakeComment, fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { createTestDatabase } from "@server/tests/utils/database";
import { insertAll, selectAll } from "@server/tests/utils/records";
import commentRouter from "..";

const createCaller = createCallerFactory(commentRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [userProjectAuthor, userOther] = await insertAll(db, "users", [
    fakeUser(),
    fakeUser(),
]);
const [Project] = await insertAll(
    db,
    "projects",
    fakeProject({
        userId: userProjectAuthor.id,
    })
);

it("allows creating a comment", async () => {
    const comment = fakeComment({ projectId: Project.id });

    const { create } = createCaller(authContext({ db }, userOther));
    const commentReturned = await create(comment);

    const [commentSaved] = await selectAll(db, "comments", (cb) =>
        cb("id", "=", commentReturned.id)
    );
    expect(commentReturned).toMatchObject(commentSaved);
    expect(commentSaved).toHaveProperty("userId", userOther.id);
    expect(commentReturned.author).toMatchObject({
        id: userOther.id,
        firstName: userOther.firstName,
        lastName: userOther.lastName,
    });

    expect((commentReturned.author as any).password).toBeUndefined();
});

it("throws an error if the Project does not exist", async () => {
    const comment = fakeComment({ projectId: Project.id + 999999 });

    const { create } = createCaller(authContext({ db }));
    await expect(create(comment)).rejects.toThrow(/not found/i);
});

describe("permissions", () => {
    const comment = fakeComment({ projectId: Project.id });

    it("allows Project author to create a comment", async () => {
        const { create } = createCaller(authContext({ db }, userProjectAuthor));

        await expect(create(comment)).resolves.toMatchObject({
            ...comment,
            userId: userProjectAuthor.id,
        });
    });

    it("allows other users to create a comment", async () => {
        const { create } = createCaller(authContext({ db }, userOther));

        await expect(create(comment)).resolves.toMatchObject({
            ...comment,
            userId: userOther.id,
        });
    });

    it("disallows non-logged in visitors to create a comment", async () => {
        const { create } = createCaller({
            db,
            req: {
                // no Auth header
                header: () => undefined,
            } as any,
        });

        await expect(create(comment)).rejects.toThrow(
            /unauthenticated|unauthorized/i
        );
    });
});
