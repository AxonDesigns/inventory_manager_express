import { db } from "@/db/database";
import { usersTable } from "@/db/schema/users";
import { Table } from "drizzle-orm";
import { MySqlTable } from "drizzle-orm/mysql-core";
import { MySql2Database } from "drizzle-orm/mysql2";
import { PgDatabase } from "drizzle-orm/pg-core";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { Request, Response } from "express";

export abstract class MySqlController {
  table: MySqlTable;
  database: MySql2Database;
  constructor(table: MySqlTable, database: MySql2Database) {
    this.table = table;
    this.database = database;
  }

  async getAll(req: Request, res: Response) {
    const users = await this.database.select().from(this.table);
    res.json(users);
  }
}

export class UsersController extends MySqlController {
  constructor() {
    super(usersTable, db);
  }
}