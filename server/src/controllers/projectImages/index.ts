import { router } from "@server/trpc";
import addImage from "./addImage";
import findById from "./findById";
import findByProjectId from "./findByProjectId";
import edit from "./edit";
import getUrl from "./getUrl";
import getUrlByProjectId from "./getUrlByProjectId";

export default router({
    addImage,
    findById,
    findByProjectId,
    edit,
    getUrl,
    getUrlByProjectId,
});
