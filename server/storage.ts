import { type User, type UpsertUser, type Reconciliation, type InsertReconciliation, type Settings, type InsertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  createReconciliation(reconciliation: InsertReconciliation): Promise<Reconciliation>;
  getReconciliation(id: number): Promise<Reconciliation | undefined>;
  getReconciliations(limit?: number): Promise<Reconciliation[]>;
  getReconciliationsByUser(userId: string): Promise<Reconciliation[]>;
  markReconciliationAsSubmitted(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reconciliations: Map<number, Reconciliation>;
  private settings: Settings | undefined;
  private nextReconciliationId: number;

  constructor() {
    this.users = new Map();
    this.reconciliations = new Map();
    this.nextReconciliationId = 1;
    this.settings = {
      id: 1,
      startingCash: '200.00',
      tolerance: '5.00',
      requireManagerApproval: true,
      googleSheetId: null,
      updatedAt: new Date(),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getSettings(): Promise<Settings> {
    if (!this.settings) {
      this.settings = {
        id: 1,
        startingCash: '200.00',
        tolerance: '5.00',
        requireManagerApproval: true,
        googleSheetId: null,
        updatedAt: new Date(),
      };
    }
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const currentSettings = await this.getSettings();
    const updated: Settings = {
      id: currentSettings.id,
      startingCash: insertSettings.startingCash || currentSettings.startingCash,
      tolerance: insertSettings.tolerance || currentSettings.tolerance,
      requireManagerApproval: insertSettings.requireManagerApproval !== undefined ? insertSettings.requireManagerApproval : currentSettings.requireManagerApproval,
      googleSheetId: insertSettings.googleSheetId !== undefined ? insertSettings.googleSheetId || null : currentSettings.googleSheetId,
      updatedAt: new Date(),
    };
    this.settings = updated;
    return updated;
  }

  async createReconciliation(insertReconciliation: InsertReconciliation): Promise<Reconciliation> {
    const id = this.nextReconciliationId++;
    const reconciliation: Reconciliation = {
      id,
      userId: insertReconciliation.userId,
      userName: insertReconciliation.userName,
      userEmail: insertReconciliation.userEmail,
      cashSales: insertReconciliation.cashSales,
      checkSales: insertReconciliation.checkSales,
      cashOut: insertReconciliation.cashOut,
      startingCash: insertReconciliation.startingCash,
      check1Date: insertReconciliation.check1Date || null,
      check1Number: insertReconciliation.check1Number || null,
      check1Name: insertReconciliation.check1Name || null,
      check1Amount: insertReconciliation.check1Amount || '0.00',
      check2Date: insertReconciliation.check2Date || null,
      check2Number: insertReconciliation.check2Number || null,
      check2Name: insertReconciliation.check2Name || null,
      check2Amount: insertReconciliation.check2Amount || '0.00',
      check3Date: insertReconciliation.check3Date || null,
      check3Number: insertReconciliation.check3Number || null,
      check3Name: insertReconciliation.check3Name || null,
      check3Amount: insertReconciliation.check3Amount || '0.00',
      hundreds: insertReconciliation.hundreds || 0,
      fifties: insertReconciliation.fifties || 0,
      twenties: insertReconciliation.twenties || 0,
      tens: insertReconciliation.tens || 0,
      fives: insertReconciliation.fives || 0,
      ones: insertReconciliation.ones || 0,
      quarters: insertReconciliation.quarters || 0,
      dimes: insertReconciliation.dimes || 0,
      nickels: insertReconciliation.nickels || 0,
      pennies: insertReconciliation.pennies || 0,
      cashCount: insertReconciliation.cashCount,
      expectedCash: insertReconciliation.expectedCash,
      difference: insertReconciliation.difference,
      notes: insertReconciliation.notes || null,
      status: insertReconciliation.status || 'completed',
      isSubmitted: false,
      submittedAt: null,
      createdAt: new Date(),
    };
    this.reconciliations.set(id, reconciliation);
    return reconciliation;
  }

  async getReconciliation(id: number): Promise<Reconciliation | undefined> {
    return this.reconciliations.get(id);
  }

  async getReconciliations(limit: number = 100): Promise<Reconciliation[]> {
    const all = Array.from(this.reconciliations.values());
    return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }

  async getReconciliationsByUser(userId: string): Promise<Reconciliation[]> {
    return Array.from(this.reconciliations.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markReconciliationAsSubmitted(id: number): Promise<void> {
    const reconciliation = this.reconciliations.get(id);
    if (reconciliation) {
      reconciliation.isSubmitted = true;
      reconciliation.submittedAt = new Date();
      this.reconciliations.set(id, reconciliation);
    }
  }
}

export const storage = new MemStorage();
