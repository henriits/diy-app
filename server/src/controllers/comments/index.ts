import { router } from "@server/trpc";
import create from "./create";
import findByProjectId from "./find";
import edit from "./edit";
import deleteComment from "./delete";
import findById from "./findById";

export default router({
    create,
    findByProjectId,
    edit,
    deleteComment,
    findById,
});
