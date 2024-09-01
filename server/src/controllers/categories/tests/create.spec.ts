import { createCallerFactory } from "@server/trpc";
import { authContext } from "@server/tests/utils/context";
import { fakeProjectCategory, fakeUser } from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { createTestDatabase } from "@server/tests/utils/database";
import { insertAll, selectAll } from "@server/tests/utils/records";
import categoryRouter from "..";

const createCaller = createCallerFactory(categoryRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(db, "users", [fakeUser()]);

it("allows creating a project category", async () => {
    const category = fakeProjectCategory();

    const { create } = createCaller(authContext({ db }, user));
    const categoryReturned = await create({ name: category.name });

    const [categorySaved] = await selectAll(db, "projectCategories", (cb) =>
        cb("id", "=", categoryReturned.id)
    );

    expect(categoryReturned).toMatchObject({
        id: categorySaved.id,
        name: category.name,
    });
    expect(categorySaved).toHaveProperty("name", category.name);
});

describe("permissions", () => {
    const category = fakeProjectCategory();

    it("allows logged-in users to create a category", async () => {
        const { create } = createCaller(authContext({ db }, user));

        await expect(create({ name: category.name })).resolves.toMatchObject({
            ...category,
        });
    });

    it("disallows non-logged in visitors to create a category", async () => {
        const { create } = createCaller({
            db,
            req: {
                header: () => undefined,
            } as any,
        });

        await expect(create({ name: category.name })).rejects.toThrow(
            /unauthenticated|unauthorized/i
        );
    });
});
