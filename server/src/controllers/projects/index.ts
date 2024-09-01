import { router } from "@server/trpc";
import create from "./create";
import findAll from "./findAll";
import findById from "./findById";
import update from "./update";
import deleteProject from "./delete";
import findByTitle from "./findByTitle";
import findByUser from "./findByUser";

export default router({
    create,
    findAll,
    findById,
    findByTitle,
    update,
    delete: deleteProject,
    findByUser,
});
