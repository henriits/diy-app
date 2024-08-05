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

describe("Ratings Controller", () => {
    it("allows creating a rating", async () => {
        const rating = fakeRating({ projectId: Project.id });

        const { create } = createCaller(authContext({ db }, userOther));
        const ratingReturned = await create(rating);

        const [ratingSaved] = await selectAll(db, "ratings", (cb) =>
            cb("id", "=", ratingReturned.id)
        );
        expect(ratingReturned).toMatchObject(ratingSaved);
        expect(ratingSaved).toHaveProperty("userId", userOther.id);
        expect(ratingReturned.userId).toBe(userOther.id);
    });

    describe("permissions", () => {
        const rating = fakeRating({ projectId: Project.id });

        it("allows Project author to create a rating", async () => {
            const { create } = createCaller(
                authContext({ db }, userProjectAuthor)
            );

            await expect(create(rating)).resolves.toMatchObject({
                ...rating,
                userId: userProjectAuthor.id,
            });
        });

        it("allows other users to create a rating", async () => {
            const { create } = createCaller(authContext({ db }, userOther));

            await expect(create(rating)).resolves.toMatchObject({
                ...rating,
                userId: userOther.id,
            });
        });

        it("disallows non-logged in visitors to create a rating", async () => {
            const { create } = createCaller({
                db,
                req: {
                    header: () => undefined,
                } as any,
            });

            await expect(create(rating)).rejects.toThrow(
                /unauthenticated|unauthorized/i
            );
        });
    });
});
