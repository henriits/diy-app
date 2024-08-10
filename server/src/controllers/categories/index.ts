import { router } from "@server/trpc";
import create from "./create";
import findAll from "./findAll";
import findByName from "./findByName";

export default router({
    create,
    findAll,
    findByName,
});
