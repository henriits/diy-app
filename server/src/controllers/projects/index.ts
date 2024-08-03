import { router } from "@server/trpc";
import create from "./create";
import findAll from "./findAll";
import get from "./get";
import update from "./update";
import deleteProject from "./delete";

export default router({
    create,
    findAll,
    get,
    update,
    delete: deleteProject,
});
