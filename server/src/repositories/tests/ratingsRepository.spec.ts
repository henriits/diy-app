import { createTestDatabase } from "@server/tests/utils/database";
import { fakeUser, fakeProject, fakeRating } from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { insertAll } from "@server/tests/utils/records";
import { pick } from "lodash-es";
import { ratingKeysPublic } from "@server/entities/ratings";
import { ratingsRepository } from "../ratingsRepository";

const db = await wrapInRollbacks(createTestDatabase());
const repository = ratingsRepository(db);

describe("ratingsRepository", () => {
    describe("create", () => {
        it("should create a new rating", async () => {
            const [user] = await insertAll(db, "users", [fakeUser()]);
            const [project] = await insertAll(db, "projects", [
                fakeProject({ userId: user.id }),
            ]);

            const rating = fakeRating({
                userId: user.id,
                projectId: project.id,
            });

            const createdRating = await repository.create(rating);

            expect(createdRating).toEqual({
                id: expect.any(Number),
                ...pick(rating, ratingKeysPublic),
                createdAt: expect.any(Date),
            });
        });
    });

    describe("update", () => {
        it("should update a rating by id", async () => {
            const [user] = await insertAll(db, "users", [fakeUser()]);
            const [project] = await insertAll(db, "projects", [
                fakeProject({ userId: user.id }),
            ]);

            const [rating] = await insertAll(db, "ratings", [
                fakeRating({ userId: user.id, projectId: project.id }),
            ]);

            const updatedData = { rating: 4 };

            await repository.update(rating.id, updatedData);

            const updatedRating = await repository.update(
                rating.id,
                updatedData
            );

            expect(updatedRating).toEqual({
                id: rating.id,
                ...updatedData,
                projectId: rating.projectId,
                userId: rating.userId,
                createdAt: expect.any(Date),
            });
        });
        it("should return undefined if rating does not exist", async () => {
            const updatedRating2 = await repository.update(99999, {
                rating: 5,
            });
            expect(updatedRating2).toBeUndefined();
        });
    });
    describe("delete", () => {
        it("should delete a rating by id", async () => {
            const [user] = await insertAll(db, "users", [fakeUser()]);
            const [project] = await insertAll(db, "projects", [
                fakeProject({ userId: user.id }),
            ]);

            const [rating] = await insertAll(db, "ratings", [
                fakeRating({ userId: user.id, projectId: project.id }),
            ]);

            await repository.delete(rating.id);

            // Verify the rating was deleted by trying to fetch it again
            const deletedRating = await repository.update(rating.id, {
                rating: 0,
            });

            expect(deletedRating).toBeUndefined();
        });

        it("should not throw an error if trying to delete a non-existent rating", async () => {
            await expect(repository.delete(9999)).resolves.not.toThrow();
        });
    });
});
