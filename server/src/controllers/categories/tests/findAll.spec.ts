// src/controllers/categories/tests/findAll.spec.ts
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
    fakeProjectCategory({ name: "Category One" }),
    fakeProjectCategory({ name: "Category Two" }),
]);

const { findAll } = createCaller(authContext({ db }, user1));

describe("findAll", () => {
    it("should return all categories", async () => {
        const categoriesResponse = await findAll();
        expect(categoriesResponse).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: category1.name }),
                expect.objectContaining({ name: category2.name }),
            ])
        );
    });
});
