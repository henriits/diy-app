import type { ColumnType } from "kysely";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Projects {
  createdAt: Generated<Timestamp>;
  description: string | null;
  id: Generated<number>;
  instructions: string | null;
  materials: string | null;
  title: string;
  updatedAt: Generated<Timestamp>;
  userId: number;
}

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
  projects: Projects;
  users: Users;
}
