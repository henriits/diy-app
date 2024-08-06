import { createCallerFactory } from "@server/trpc";
import { authContext } from "@server/tests/utils/context";
import { fakeImage, fakeProject, fakeUser } from "@server/tests/utils/fakes";
import { wrapInRollbacks } from "@server/tests/utils/transactions";
import { createTestDatabase } from "@server/tests/utils/database";
import { insertAll, selectAll } from "@server/tests/utils/records";
import { TRPCError } from "@trpc/server";
import addImage from "..";

const createCaller = createCallerFactory(addImage);
const db = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(db, "users", [fakeUser()]);
const [existingProject] = await insertAll(db, "projects", [
    fakeProject({ userId: user.id }),
]);

it("allows adding an image to an existing project", async () => {
    const newImage = fakeImage({
        projectId: existingProject.id,
        userId: user.id,
    });

    const { addImage: addImageProcedure } = createCaller(
        authContext({ db }, user)
    );
    const addedImage = await addImageProcedure(newImage);

    const [imageInDb] = await selectAll(db, "projectImages", (cb) =>
        cb("id", "=", addedImage.id)
    );

    expect(imageInDb).toMatchObject(newImage);
});

it("throws an error if the project does not exist", async () => {
    const nonExistentProjectId = 999999;
    const newImage = fakeImage({
        projectId: nonExistentProjectId,
        userId: user.id,
    });

    const { addImage: addImageProcedure } = createCaller(
        authContext({ db }, user)
    );
    await expect(addImageProcedure(newImage)).rejects.toThrow(
        new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
        })
    );
});

it("returns the URL of the added image", async () => {
    const newImage = fakeImage({
        projectId: existingProject.id,
        userId: user.id,
    });

    const { addImage: addImageProcedure } = createCaller(
        authContext({ db }, user)
    );
    const addedImage = await addImageProcedure(newImage);

    expect(addedImage).toHaveProperty("imageUrl", newImage.imageUrl);
});
