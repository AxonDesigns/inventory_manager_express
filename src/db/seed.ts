import { db } from '@/db/database';
import { rolesSchema } from '@/db/schema/roles';
import { usersSchema } from '@/db/schema/users';
import { genSalt, hash } from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import { paymentMethodsSchema, transactionCategoriesSchema } from './schema/transactions';

async function seedUsers() {
  await db.transaction(async (tx) => {
    const existentAdminRole = await tx.select().from(rolesSchema).where(eq(rolesSchema.name, "admin"));
    const existentUserRole = await tx.select().from(rolesSchema).where(eq(rolesSchema.name, "user"));

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

    const savedIds = await tx.insert(rolesSchema).values(roles).$returningId();
    const savedRoles = await tx.select().from(rolesSchema).where(or(...savedIds.map((savedId) => eq(rolesSchema.id, savedId.id))));
    console.log(savedRoles);
  });

  await db.transaction(async (tx) => {
    const exists = await tx.select().from(usersSchema).where(eq(usersSchema.email, 'admin@admin.com'));
    if (exists.length > 0) return;

    const roles = await tx.select({ id: rolesSchema.id }).from(rolesSchema).where(eq(rolesSchema.name, 'admin'));

    if (roles.length === 0) {
      console.error('Admin role not found!');
      return;
    }

    const savedId = await tx.insert(usersSchema).values({
      name: 'Admin',
      email: 'admin@admin.com',
      roleId: roles[0].id,
      password: await hash(process.env.ADMIN_PASSWORD!, await genSalt()),
    }).$returningId();

    const savedUser = await tx.select().from(usersSchema).where(eq(usersSchema.id, savedId[0].id));
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
}

main();