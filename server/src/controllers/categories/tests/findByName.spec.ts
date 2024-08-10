import { describe, it, expect } from "vitest";
import { authContext } from "@server/tests/utils/context";
import { fakeProjectCategory, fakeUser } from "@server/tests/utils/fakes";
import { createTestDatabase } from "@server/tests/utils/database";
import { createCallerFactory } from "@server/trpc";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { insertAll } from "@server/tests/utils/records";
import categoriesRouter from "..";

const createCaller = createCallerFactory(categoriesRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [user1] = await insertAll(db, "users", [fakeUser()]);

const [category1, category2] = await insertAll(db, "projectCategories", [
    fakeProjectCategory({ name: "woodworking" }),
    fakeProjectCategory({ name: "metalworking" }),
]);

const { findByName } = createCaller(authContext({ db }, user1));

describe("findByName", () => {
    it("should return categories with matching name", async () => {
        const categoryResponse = await findByName({ name: "Woodworking" });
        expect(categoryResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: category1.name }),
            ])
        );
    });

    it("should return an empty array if no categories match the name", async () => {
        const categoryResponse = await findByName({ name: "Nonexistent Name" });
        expect(categoryResponse).toEqual([]);
    });

    it("should handle partial name matches", async () => {
        const categoryResponse = await findByName({ name: "work" });
        expect(categoryResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: category1.name }),
                expect.objectContaining({ name: category2.name }),
            ])
        );
    });

    it("should be case-insensitive", async () => {
        const categoryResponse = await findByName({ name: "wOOdWorKinG" });
        expect(categoryResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: category1.name }),
            ])
        );
    });
});
