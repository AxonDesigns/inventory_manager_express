import { db } from "@/db/database";
import { userRolesTable } from "@/db/schema/roles";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

export const getUserRoles = async (req: Request, res: Response) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        res.status(400).json({ errors: results.array().map((err) => err.msg) });
        return;
    }
    const { limit, offset } = matchedData(req) as { limit?: number, offset?: number };

    const foundRoles = await db.select().from(userRolesTable).limit(limit ?? 20).offset(offset ?? 0);

    res.json(foundRoles);
};

export const createUserRole = async (req: Request, res: Response) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        res.status(400).json({ errors: results.array().map((err) => err.msg) });
        return;
    }

    const { name, description } = matchedData(req) as { name: string, description: string };

    const existentRole = await db.select().from(userRolesTable).where(eq(userRolesTable.name, name));

    if (existentRole.length > 0) {
        res.status(400).json({ errors: ["Role already exists"] });
        return;
    }

    await db.insert(userRolesTable).values({
        name,
        description,
    });

    res.status(201).json({ message: "Role created successfully" });
};

export const getUserRoleById = async (req: Request, res: Response) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        res.status(400).json({ errors: results.array().map((err) => err.msg) });
        return;
    }
    const { id } = matchedData(req) as { id: string };

    const foundRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.id, id));

    if (foundRoles.length === 0) {
        res.status(404).json({ errors: ["Role not found"] });
        return;
    }

    res.json(foundRoles[0]);
};

export const getUserRoleByName = async (req: Request, res: Response) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        res.status(400).json({ errors: results.array().map((err) => err.msg) });
        return;
    }
    const { name } = matchedData(req) as { name: string };

    const foundRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.name, name));

    if (foundRoles.length === 0) {
        res.status(404).json({ errors: ["Role not found"] });
        return;
    }

    res.json(foundRoles[0]);
};

export const updateUserRole = async (req: Request, res: Response) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        res.status(400).json({ errors: results.array().map((err) => err.msg) });
        return;
    }

    const { id, name, description } = matchedData(req) as { id: string, name?: string, description?: string };

    if (!name && !description) {
        res.status(400).json({ errors: ["At least one field must be updated"] });
        return;
    }

    const foundRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.id, id));

    if (foundRoles.length === 0) {
        res.status(404).json({ errors: ["Role not found"] });
        return;
    }

    db.transaction(async (tx) => {
        await tx.update(userRolesTable).set({
            name: name,
            description: description,
        }).where(eq(userRolesTable.id, id));

        const updatedRoles = await tx.select().from(userRolesTable).where(eq(userRolesTable.id, id));
        if (updatedRoles.length === 0) {
            tx.rollback();
            res.status(500).json({ errors: ["Error getting updated role"] });
            return;
        }

        res.json(updatedRoles[0]);
    });
};

export const deleteUserRole = async (req: Request, res: Response) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        res.status(400).json({ errors: results.array().map((err) => err.msg) });
        return;
    }

    const { id } = matchedData(req) as { id: string };

    const foundRoles = await db.select().from(userRolesTable).where(eq(userRolesTable.id, id));

    if (foundRoles.length === 0) {
        res.status(404).json({ errors: ["Role not found"] });
        return;
    }

    await db.delete(userRolesTable).where(eq(userRolesTable.id, id));

    res.json(foundRoles[0]);
};