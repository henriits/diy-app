import { router } from "@server/trpc";
import create from "./create";
import findAll from "./findAll";
import findById from "./findById";
import update from "./update";
import deleteProject from "./delete";

export default router({
    create,
    findAll,
    findById,
    update,
    delete: deleteProject,
});
