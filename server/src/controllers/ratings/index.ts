import { router } from "@server/trpc";
import create from "./create";
import update from "./update";
import deleteRating from "./delete";

export default router({
    create,
    update,
    deleteRating,
});
