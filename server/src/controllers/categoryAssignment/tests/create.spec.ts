import { createCallerFactory } from "@server/trpc";
import { authContext } from "@server/tests/utils/context";
import {
    fakeProject,
    fakeProjectCategory,
    fakeUser,
} from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { createTestDatabase } from "@server/tests/utils/database";
import { insertAll } from "@server/tests/utils/records";
import categoryAssignmentsRouter from "..";

const createCaller = createCallerFactory(categoryAssignmentsRouter);
const db = await wrapInRollbacks(createTestDatabase());

it("should create a category assignment for a given project and category", async () => {
    const { create } = createCaller(authContext({ db }));

    // Insert users, projects, and categories
    const [user] = await insertAll(db, "users", [fakeUser()]);
    const [project1] = await insertAll(db, "projects", [
        fakeProject({ userId: user.id }),
    ]);
    const [category1] = await insertAll(db, "projectCategories", [
        fakeProjectCategory(),
    ]);

    // Prepare assignment
    const assignment = {
        projectId: project1.id,
        categoryId: category1.id,
    };

    // Attempt to create assignment
    const assignmentCreated = await create(assignment);

    expect(assignmentCreated).toMatchObject({
        projectId: project1.id,
        categoryId: category1.id,
    });

    // Check if assignment is correctly created
    const createdAssignment = await db
        .selectFrom("projectCategoryAssignments")
        .where("projectId", "=", project1.id)
        .where("categoryId", "=", category1.id)
        .select(["projectId", "categoryId"])
        .executeTakeFirst();

    expect(createdAssignment).toMatchObject({
        projectId: project1.id,
        categoryId: category1.id,
    });
});
it("should throw an error if the assignment already exists", async () => {
    const { create } = createCaller(authContext({ db }));
    const [user] = await insertAll(db, "users", [fakeUser()]);
    const [project] = await insertAll(db, "projects", [
        fakeProject({ userId: user.id }),
    ]);
    const [category] = await insertAll(db, "projectCategories", [
        fakeProjectCategory(),
    ]);

    const assignment = {
        projectId: project.id,
        categoryId: category.id,
    };

    // Create the assignment
    await create(assignment);

    // Try to create the same assignment again
    await expect(create(assignment)).rejects.toThrow(
        `Assignment for project ID ${project.id} and category ID ${
            category.id
        } already exists`
    );
});
