import { router } from "@server/trpc";
import create from "./create";
import findByProjectId from "./find";

export default router({
    create,
    findByProjectId,
});
