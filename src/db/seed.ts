import { db } from '@/db/database';
import { userRolesTable } from '@/db/schema/user-roles';
import { usersTable } from '@/db/schema/users';
import { genSalt, hash } from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import { paymentMethodsSchema, transactionCategoriesSchema } from './schema/transactions';
import { InsertUserStatus, userStatusesTable } from './schema/user-status';

async function seedUsers() {
  // Seed roles
  await db.transaction(async (tx) => {
    const [existentAdminRole] = await tx.select().from(userRolesTable).where(eq(userRolesTable.name, "admin"));
    const [existentUserRole] = await tx.select().from(userRolesTable).where(eq(userRolesTable.name, "user"));

    const roles = [];
    if (!existentAdminRole) {
      roles.push({
        name: "admin",
        description: "Administrator",
      });
    }

    if (!existentUserRole) {
      roles.push({
        name: "user",
        description: "User",
      });
    }

    if (roles.length === 0) return;

    const savedIds = await tx.insert(userRolesTable).values(roles).$returningId();
    const savedRoles = await tx.select().from(userRolesTable).where(or(...savedIds.map((savedId) => eq(userRolesTable.id, savedId.id))));
    console.log(savedRoles);
  });

  await db.transaction(async (tx) => {
    const [existentActiveStatus] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.name, "active"));
    const [existentInactiveStatus] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.name, "inactive"));
    const [existentSuspendedStatus] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.name, "suspended"));
    const [existentPendingStatus] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.name, "pending"));

    const statuses = [] as InsertUserStatus[]
    if (!existentActiveStatus) {
      statuses.push({
        name: "active",
        description: "Active",
      })
    }

    if (!existentInactiveStatus) {
      statuses.push({
        name: "inactive",
        description: "Inactive",
      })
    }

    if (!existentSuspendedStatus) {
      statuses.push({
        name: "suspended",
        description: "Suspended",
      })
    }

    if (!existentPendingStatus) {
      statuses.push({
        name: "pending",
        description: "Pending",
      })
    }

    if (statuses.length === 0) return;

    const storedIds = await tx.insert(userStatusesTable).values(statuses).$returningId();
    console.log(statuses, "has been added with ids ", storedIds);
  });

  await db.transaction(async (tx) => {
    const [exists] = await tx.select().from(usersTable).where(eq(usersTable.email, 'admin@admin.com'));
    if (exists) return;

    const [role] = await tx.select({ id: userRolesTable.id }).from(userRolesTable).where(eq(userRolesTable.name, 'admin'));

    if (!role) {
      console.error('Admin role not found!');
      return;
    }

    const [existentStatus] = await tx.select().from(userStatusesTable).where(eq(userStatusesTable.name, "active"));

    if (!existentStatus) {
      console.error('active status not found!');
      return;
    }

    const savedId = await tx.insert(usersTable).values({
      name: 'Admin',
      email: 'admin@admin.com',
      roleId: role.id,
      statusId: existentStatus.id,
      password: await hash(process.env.ADMIN_PASSWORD!, await genSalt()),
    }).$returningId();

    const savedUser = await tx.select().from(usersTable).where(eq(usersTable.id, savedId[0].id));
    if (savedUser.length === 0) {
      console.error('Admin user not found!');
      return;
    }
    console.log(savedUser[0]);
  });
}

async function seedPaymentMethods() {
  // Cash
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(paymentMethodsSchema).where(eq(paymentMethodsSchema.name, "Cash"));
    if (existent.length > 0) return;
    await tx.insert(paymentMethodsSchema).values({
      name: "Cash",
    });
  });

  // Credit Card
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(paymentMethodsSchema).where(eq(paymentMethodsSchema.name, "Credit Card"));
    if (existent.length > 0) return;
    await tx.insert(paymentMethodsSchema).values({
      name: "Credit Card",
    });
  });

  // Debit Card
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(paymentMethodsSchema).where(eq(paymentMethodsSchema.name, "Debit Card"));
    if (existent.length > 0) return;
    await tx.insert(paymentMethodsSchema).values({
      name: "Debit Card",
    });
  });
}

async function seedTransactionCategories() {
  // Food
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Food"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Food",
    });
  });

  //Transportation
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Transportation"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Transportation",
    });
  });

  //Entertainment
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Entertainment"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Entertainment",
    });
  });

  // Health
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Health"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Health",
    });
  });

  // Cleaning
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Cleaning"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Cleaning",
    });
  });

  // Technology
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Technology"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Technology",
    });
  });

  // Stationery
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Stationery"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Stationery",
    });
  });

  // Other
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesSchema).where(eq(transactionCategoriesSchema.name, "Other"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesSchema).values({
      name: "Other",
    });
  });
}

async function main() {

  await seedUsers();
  console.log('Users and roles seeded!');
  await seedPaymentMethods();
  console.log('Payment methods seeded!');
  await seedTransactionCategories();
  console.log('Transaction categories seeded!');

  process.exit(0);
}

main();