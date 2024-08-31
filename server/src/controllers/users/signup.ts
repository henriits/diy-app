import { hash } from "bcrypt";
import { publicProcedure } from "@server/trpc";
import config from "@server/config";
import { TRPCError } from "@trpc/server";
import provideRepos from "@server/trpc/provideRepos";
import { usersRepository } from "@server/repositories/usersRepository";
import { assertError } from "@server/utils/errors";
import { userSchema } from "@server/entities/users";
import logger from "@server/utils/logger";

export default publicProcedure
    .use(
        provideRepos({
            usersRepository,
        })
    )
    .input(
        userSchema.pick({
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            password: true,
        })
    )
    .mutation(async ({ input: user, ctx: { repos } }) => {
        const passwordHash = await hash(
            user.password,
            config.auth.passwordCost
        );

        const userCreated = await repos.usersRepository
            .create({
                ...user,
                password: passwordHash,
            })
            .catch((error: unknown) => {
                assertError(error);

                if (error.message.includes("users_username_key")) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "User with this username already exists.",
                        cause: error,
                    });
                }

                if (error.message.includes("users_email_key")) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "User with this email already exists.",
                        cause: error,
                    });
                }

                throw error;
            });
        logger.info(`New user created: ${user.username}`);
        return {
            id: userCreated.id,
        };
    });
