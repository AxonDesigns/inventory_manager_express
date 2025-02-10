import { userRolesTable } from '@/db/schema/user-roles';
import { userStatusesTable } from '@/db/schema/user-statuses';
import { usersTable } from '@/db/schema/users';

export type SelectUserRole = typeof userRolesTable.$inferSelect;
export type InsertUserRole = typeof userRolesTable.$inferInsert;

export type SelectUserStatus = typeof userStatusesTable.$inferSelect;
export type InsertUserStatus = typeof userStatusesTable.$inferInsert;

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export type SelectExpandedUser = Omit<SelectUser, "roleId" | "statusId"> & {
  role: SelectUserRole;
  status: SelectUserStatus;
}

export type SelectPublicUser = Omit<SelectUser, "password" | "verificationToken">;
export type SelectPublicExpandedUser = Omit<SelectExpandedUser, "password" | "verificationToken">;