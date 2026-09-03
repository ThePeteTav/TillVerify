import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { employees, settings, reconciliations } from "@shared/schema";
import {
  type Employee,
  type PublicEmployee,
  type InsertEmployee,
  type UpdateEmployee,
  type Reconciliation,
  type InsertReconciliation,
  type Settings,
  type InsertSettings,
} from "@shared/schema";

const DEFAULT_SETTINGS_ID = 1;

function toPublic(employee: Employee): PublicEmployee {
  const { pinHash, ...rest } = employee;
  return rest;
}

export interface IStorage {
  getEmployee(id: string): Promise<Employee | undefined>;
  getActiveEmployees(): Promise<PublicEmployee[]>;
  getAllEmployees(): Promise<PublicEmployee[]>;
  createEmployee(employee: InsertEmployee): Promise<PublicEmployee>;
  updateEmployee(id: string, updates: UpdateEmployee): Promise<PublicEmployee | undefined>;
  deleteEmployee(id: string): Promise<void>;
  verifyPin(employeeId: string, pin: string): Promise<Employee | undefined>;

  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;

  createReconciliation(reconciliation: InsertReconciliation): Promise<Reconciliation>;
  getReconciliation(id: number): Promise<Reconciliation | undefined>;
  getReconciliations(limit?: number): Promise<Reconciliation[]>;
  getReconciliationsByUser(userId: string): Promise<Reconciliation[]>;
  markReconciliationAsSubmitted(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getActiveEmployees(): Promise<PublicEmployee[]> {
    const rows = await db.select().from(employees).where(eq(employees.active, true));
    return rows.map(toPublic);
  }

  async getAllEmployees(): Promise<PublicEmployee[]> {
    const rows = await db.select().from(employees).orderBy(employees.name);
    return rows.map(toPublic);
  }

  async createEmployee(employee: InsertEmployee): Promise<PublicEmployee> {
    const pinHash = await bcrypt.hash(employee.pin, 10);
    const [created] = await db
      .insert(employees)
      .values({
        name: employee.name,
        role: employee.role,
        active: employee.active ?? true,
        pinHash,
      })
      .returning();
    return toPublic(created);
  }

  async updateEmployee(id: string, updates: UpdateEmployee): Promise<PublicEmployee | undefined> {
    const patch: Partial<typeof employees.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.role !== undefined) patch.role = updates.role;
    if (updates.active !== undefined) patch.active = updates.active;
    if (updates.pin !== undefined) patch.pinHash = await bcrypt.hash(updates.pin, 10);

    const [updated] = await db
      .update(employees)
      .set(patch)
      .where(eq(employees.id, id))
      .returning();
    return updated ? toPublic(updated) : undefined;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async verifyPin(employeeId: string, pin: string): Promise<Employee | undefined> {
    const employee = await this.getEmployee(employeeId);
    if (!employee || !employee.active) return undefined;
    const matches = await bcrypt.compare(pin, employee.pinHash);
    return matches ? employee : undefined;
  }

  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).where(eq(settings.id, DEFAULT_SETTINGS_ID));
    if (existing) return existing;

    const [created] = await db
      .insert(settings)
      .values({ id: DEFAULT_SETTINGS_ID })
      .onConflictDoNothing()
      .returning();
    if (created) return created;

    const [fallback] = await db.select().from(settings).where(eq(settings.id, DEFAULT_SETTINGS_ID));
    return fallback;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set({ ...insertSettings, updatedAt: new Date() })
      .where(eq(settings.id, DEFAULT_SETTINGS_ID))
      .returning();
    return updated;
  }

  async createReconciliation(insertReconciliation: InsertReconciliation): Promise<Reconciliation> {
    const [created] = await db.insert(reconciliations).values(insertReconciliation).returning();
    return created;
  }

  async getReconciliation(id: number): Promise<Reconciliation | undefined> {
    const [reconciliation] = await db.select().from(reconciliations).where(eq(reconciliations.id, id));
    return reconciliation;
  }

  async getReconciliations(limit: number = 100): Promise<Reconciliation[]> {
    return db.select().from(reconciliations).orderBy(desc(reconciliations.createdAt)).limit(limit);
  }

  async getReconciliationsByUser(userId: string): Promise<Reconciliation[]> {
    return db
      .select()
      .from(reconciliations)
      .where(eq(reconciliations.userId, userId))
      .orderBy(desc(reconciliations.createdAt));
  }

  async markReconciliationAsSubmitted(id: number): Promise<void> {
    await db
      .update(reconciliations)
      .set({ isSubmitted: true, submittedAt: new Date() })
      .where(eq(reconciliations.id, id));
  }
}

export const storage = new DatabaseStorage();
