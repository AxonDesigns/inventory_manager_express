import { db } from '@/db/database';
import { rolesTable } from '@/db/schema/roles';
import { usersTable } from '@/db/schema/users';
import { genSalt, hash } from 'bcrypt';
import { eq, or } from 'drizzle-orm';

async function main() {
  await db.transaction(async (transaction) => {
    const existentAdminRole = await transaction.select().from(rolesTable).where(eq(rolesTable.name, "admin"));
    const existentUserRole = await transaction.select().from(rolesTable).where(eq(rolesTable.name, "user"));

    const roles = [];
    if (existentAdminRole.length === 0) {
      roles.push({
        name: "admin",
        description: "Administrator",
      });
    }

    if (existentUserRole.length === 0) {
      roles.push({
        name: "user",
        description: "User",
      });
    }

    if (roles.length === 0) return;

    const savedIds = await transaction.insert(rolesTable).values(roles).$returningId();
    const savedRoles = await transaction.select().from(rolesTable).where(or(...savedIds.map((savedId) => eq(rolesTable.id, savedId.id))));
    console.log(savedRoles);
  });

  await db.transaction(async (transaction) => {
    const exists = await transaction.select().from(usersTable).where(eq(usersTable.email, 'admin@example.com'));
    if (exists.length > 0) return;

    const roles = await transaction.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, 'admin'));

    if (roles.length === 0) {
      console.error('Admin role not found!');
      return;
    }

    const savedId = await transaction.insert(usersTable).values({
      name: 'Admin',
      email: 'admin@example.com',
      roleId: roles[0].id,
      password: await hash(process.env.ADMIN_PASSWORD!, await genSalt()),
    }).$returningId();

    const savedUser = await transaction.select().from(usersTable).where(eq(usersTable.id, savedId[0].id));
    if (savedUser.length === 0) {
      console.error('Admin user not found!');
      return;
    }
    console.log(savedUser[0]);
  });

  console.log('Database seeded!');
  return;
}

main();