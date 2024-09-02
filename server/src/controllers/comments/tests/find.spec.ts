import { createCallerFactory } from "@server/trpc";
import { authContext } from "@server/tests/utils/context";
import { fakeComment, fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { createTestDatabase } from "@server/tests/utils/database";
import { insertAll } from "@server/tests/utils/records";
import commentRouter from "..";

const createCaller = createCallerFactory(commentRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [userProjectAuthor, userOther] = await insertAll(db, "users", [
    fakeUser(),
    fakeUser(),
]);
const [project] = await insertAll(
    db,
    "projects",
    fakeProject({
        userId: userProjectAuthor.id,
    })
);
const [comment1, comment2] = await insertAll(db, "comments", [
    fakeComment({ projectId: project.id, userId: userOther.id }),
    fakeComment({ projectId: project.id, userId: userProjectAuthor.id }),
]);

describe("findByProjectId Procedure", () => {
    it("should return comments for a given projectId", async () => {
        const { findByProjectId } = createCaller(authContext({ db }));

        const commentsReturned = await findByProjectId({
            projectId: project.id,
        });

        expect(commentsReturned).toHaveLength(2);
        expect(commentsReturned).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: comment1.id,
                    projectId: project.id,
                    userId: userOther.id,
                    content: comment1.content,
                }),
                expect.objectContaining({
                    id: comment2.id,
                    projectId: project.id,
                    userId: userProjectAuthor.id,
                    content: comment2.content,
                }),
            ])
        );
    });

    describe("permissions", () => {
        it("allows project author to get comments of their own project", async () => {
            const { findByProjectId } = createCaller(
                authContext({ db }, userProjectAuthor)
            );

            const commentsReturned = await findByProjectId({
                projectId: project.id,
            });

            expect(commentsReturned).toHaveLength(2);
        });

        it("allows other users to get comments of a project they are not associated with", async () => {
            const { findByProjectId } = createCaller(
                authContext({ db }, userOther)
            );

            const commentsReturned = await findByProjectId({
                projectId: project.id,
            });

            expect(commentsReturned).toHaveLength(2);
        });
    });
});
