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
        updatedAt: new Date(),
      };
    }
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const updated: Settings = {
      id: this.settings?.id || 1,
      startingCash: insertSettings.startingCash || '200.00',
      tolerance: insertSettings.tolerance || '5.00',
      requireManagerApproval: insertSettings.requireManagerApproval !== undefined ? insertSettings.requireManagerApproval : true,
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
      totalSales: insertReconciliation.totalSales,
      cashSales: insertReconciliation.cashSales,
      cardSales: insertReconciliation.cardSales,
      cashOut: insertReconciliation.cashOut,
      startingCash: insertReconciliation.startingCash,
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
}

export const storage = new MemStorage();
