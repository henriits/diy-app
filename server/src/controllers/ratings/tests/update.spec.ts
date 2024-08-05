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

it("allows updating a rating", async () => {
    const initialRating = fakeRating({
        projectId: Project.id,
        userId: userProjectAuthor.id,
    });
    const [createdRating] = await insertAll(db, "ratings", [initialRating]);
    const updatedRatingData = { id: createdRating.id, rating: 4 };

    const { update } = createCaller(authContext({ db }, userProjectAuthor));
    const updatedRating = await update(updatedRatingData);

    const [ratingSaved] = await selectAll(db, "ratings", (cb) =>
        cb("id", "=", updatedRating.id)
    );

    expect(updatedRating).toMatchObject(ratingSaved);
    expect(ratingSaved).toHaveProperty("rating", 4);
});

it("throws an error if updating a non-existent rating", async () => {
    const updatedRatingData = { id: 999999, rating: 4 };

    const { update } = createCaller(authContext({ db }, userProjectAuthor));
    await expect(update(updatedRatingData)).rejects.toThrow(
        /Rating not found/i
    );
});

describe("permissions", () => {
    const rating = fakeRating({
        projectId: Project.id,
        userId: userProjectAuthor.id,
    });

    it("allows Project author to update a rating", async () => {
        const [createdRating] = await insertAll(db, "ratings", [rating]);
        const updatedRatingData = { id: createdRating.id, rating: 4 };

        const { update } = createCaller(authContext({ db }, userProjectAuthor));
        await expect(update(updatedRatingData)).resolves.toMatchObject({
            ...updatedRatingData,
            userId: userProjectAuthor.id,
        });
    });

    it("allows other users to update a rating", async () => {
        const [createdRating] = await insertAll(db, "ratings", [rating]);
        const updatedRatingData = { id: createdRating.id, rating: 4 };

        const { update } = createCaller(authContext({ db }, userOther));
        await expect(update(updatedRatingData)).resolves.toMatchObject({
            ...updatedRatingData,
            userId: userOther.id,
        });
    });

    it("disallows non-logged in visitors to update a rating", async () => {
        const [createdRating] = await insertAll(db, "ratings", [rating]);
        const updatedRatingData = { id: createdRating.id, rating: 4 };

        const { update } = createCaller({
            db,
            req: {
                // no Auth header
                header: () => undefined,
            } as any,
        });

        await expect(update(updatedRatingData)).rejects.toThrow(
            /unauthenticated|unauthorized/i
        );
    });
});
