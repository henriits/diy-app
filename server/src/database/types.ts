import type { ColumnType } from "kysely";

export type Generated<T> =
    T extends ColumnType<infer S, infer I, infer U>
        ? ColumnType<S, I | undefined, U>
        : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Users {
    createdAt: Generated<Timestamp>;
    email: string;
    firstName: string;
    id: Generated<number>;
    isAdmin: Generated<boolean>;
    lastName: string;
    password: string;
    username: string;
}

export interface DB {
    users: Users;
}
