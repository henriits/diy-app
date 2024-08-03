import type { Database } from "@server/database";
import { middleware } from "..";

export default function withTransaction() {
    return middleware(async ({ ctx, next }) => {
        const db: Database = ctx.db;

        return db.transaction().execute(async (trx) => {
            return next({
                ctx: {
                    ...ctx,
                    db: trx,
                },
            });
        });
    });
}
