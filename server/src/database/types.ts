import type { ColumnType } from "kysely";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Comments {
  content: string;
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  projectId: number;
  userId: number;
}

export interface ProjectCategories {
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
}

export interface ProjectCategoryAssignments {
  categoryId: number;
  projectId: number;
}

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

export interface Ratings {
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  projectId: number;
  rating: number;
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
  comments: Comments;
  projectCategories: ProjectCategories;
  projectCategoryAssignments: ProjectCategoryAssignments;
  projects: Projects;
  ratings: Ratings;
  users: Users;
}
