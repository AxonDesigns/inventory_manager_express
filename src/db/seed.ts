import { db } from '@/db/database';
import { rolesTable } from '@/db/schema/roles';
import { usersTable } from '@/db/schema/users';
import { genSalt, hash } from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import { paymentMethodsTable, transactionCategoriesTable } from './schema/transactions';

async function seedUsers() {
  await db.transaction(async (tx) => {
    const existentAdminRole = await tx.select().from(rolesTable).where(eq(rolesTable.name, "admin"));
    const existentUserRole = await tx.select().from(rolesTable).where(eq(rolesTable.name, "user"));

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

    const savedIds = await tx.insert(rolesTable).values(roles).$returningId();
    const savedRoles = await tx.select().from(rolesTable).where(or(...savedIds.map((savedId) => eq(rolesTable.id, savedId.id))));
    console.log(savedRoles);
  });

  await db.transaction(async (tx) => {
    const exists = await tx.select().from(usersTable).where(eq(usersTable.email, 'admin@admin.com'));
    if (exists.length > 0) return;

    const roles = await tx.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, 'admin'));

    if (roles.length === 0) {
      console.error('Admin role not found!');
      return;
    }

    const savedId = await tx.insert(usersTable).values({
      name: 'Admin',
      email: 'admin@admin.com',
      roleId: roles[0].id,
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
    const existent = await tx.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.name, "Cash"));
    if (existent.length > 0) return;
    await tx.insert(paymentMethodsTable).values({
      name: "Cash",
    });
  });

  // Credit Card
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.name, "Credit Card"));
    if (existent.length > 0) return;
    await tx.insert(paymentMethodsTable).values({
      name: "Credit Card",
    });
  });

  // Debit Card
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.name, "Debit Card"));
    if (existent.length > 0) return;
    await tx.insert(paymentMethodsTable).values({
      name: "Debit Card",
    });
  });
}

async function seedTransactionCategories() {
  // Food
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Food"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
      name: "Food",
    });
  });

  //Transportation
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Transportation"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
      name: "Transportation",
    });
  });

  //Entertainment
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Entertainment"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
      name: "Entertainment",
    });
  });

  // Health
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Health"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
      name: "Health",
    });
  });

  // Cleaning
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Cleaning"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
      name: "Cleaning",
    });
  });

  // Technology
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Technology"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
      name: "Technology",
    });
  });

  // Stationery
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Stationery"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
      name: "Stationery",
    });
  });

  // Other
  await db.transaction(async (tx) => {
    const existent = await tx.select().from(transactionCategoriesTable).where(eq(transactionCategoriesTable.name, "Other"));
    if (existent.length > 0) return;
    await tx.insert(transactionCategoriesTable).values({
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
}

main();