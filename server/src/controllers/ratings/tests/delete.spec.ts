import { createCallerFactory } from "@server/trpc";
import { authContext } from "@server/tests/utils/context";
import { fakeRating, fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { createTestDatabase } from "@server/tests/utils/database";
import { insertAll, selectAll } from "@server/tests/utils/records";
import ratingRouter from "..";

const createCaller = createCallerFactory(ratingRouter);
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
it("allows deleting a rating that belongs to the authenticated user", async () => {
    const initialRating = fakeRating({
        projectId: Project.id,
        userId: userProjectAuthor.id,
    });
    const [createdRating] = await insertAll(db, "ratings", [initialRating]);

    const { deleteRating } = createCaller(
        authContext({ db }, userProjectAuthor)
    );
    await deleteRating({ id: createdRating.id });

    const [ratingAfterDeletion] = await selectAll(db, "ratings", (cb) =>
        cb("id", "=", createdRating.id)
    );

    expect(ratingAfterDeletion).toBeUndefined();
});
it("throws an error if trying to delete a non-existent rating", async () => {
    const { deleteRating } = createCaller(
        authContext({ db }, userProjectAuthor)
    );
    await expect(deleteRating({ id: 999999 })).rejects.toThrow(
        /Rating not found/i
    );
});

it("throws an error if the rating does not belong to the authenticated user", async () => {
    const initialRating = fakeRating({
        projectId: Project.id,
        userId: userProjectAuthor.id,
    });
    const [createdRating] = await insertAll(db, "ratings", [initialRating]);

    const { deleteRating } = createCaller(authContext({ db }, userOther));
    await expect(deleteRating({ id: createdRating.id })).rejects.toThrow(
        /Unauthorized/i
    );
});
