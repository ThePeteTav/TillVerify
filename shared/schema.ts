import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, decimal, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  pinHash: varchar("pin_hash").notNull(),
  role: text("role").notNull().default('employee'), // 'employee' | 'manager' | 'admin'
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  startingCash: decimal("starting_cash", { precision: 10, scale: 2 }).notNull().default('200.00'),
  tolerance: decimal("tolerance", { precision: 10, scale: 2 }).notNull().default('5.00'),
  requireManagerApproval: boolean("require_manager_approval").notNull().default(true),
  googleSheetId: text("google_sheet_id"),
  companyLogo: text("company_logo"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reconciliations = pgTable("reconciliations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),

  cashSales: decimal("cash_sales", { precision: 10, scale: 2 }).notNull(),
  checkSales: decimal("check_sales", { precision: 10, scale: 2 }).notNull(),
  cashOut: decimal("cash_out", { precision: 10, scale: 2 }).notNull(),
  startingCash: decimal("starting_cash", { precision: 10, scale: 2 }).notNull(),
  
  check1Date: text("check1_date"),
  check1Number: text("check1_number"),
  check1Name: text("check1_name"),
  check1Amount: decimal("check1_amount", { precision: 10, scale: 2 }).default('0.00'),
  
  check2Date: text("check2_date"),
  check2Number: text("check2_number"),
  check2Name: text("check2_name"),
  check2Amount: decimal("check2_amount", { precision: 10, scale: 2 }).default('0.00'),
  
  check3Date: text("check3_date"),
  check3Number: text("check3_number"),
  check3Name: text("check3_name"),
  check3Amount: decimal("check3_amount", { precision: 10, scale: 2 }).default('0.00'),
  
  hundreds: integer("hundreds").notNull().default(0),
  fifties: integer("fifties").notNull().default(0),
  twenties: integer("twenties").notNull().default(0),
  tens: integer("tens").notNull().default(0),
  fives: integer("fives").notNull().default(0),
  ones: integer("ones").notNull().default(0),
  quarters: integer("quarters").notNull().default(0),
  dimes: integer("dimes").notNull().default(0),
  nickels: integer("nickels").notNull().default(0),
  pennies: integer("pennies").notNull().default(0),
  
  cashCount: decimal("cash_count", { precision: 10, scale: 2 }).notNull(),
  expectedCash: decimal("expected_cash", { precision: 10, scale: 2 }).notNull(),
  difference: decimal("difference", { precision: 10, scale: 2 }).notNull(),
  
  notes: text("notes"),
  status: text("status").notNull().default('completed'),
  isSubmitted: boolean("is_submitted").notNull().default(false),
  submittedAt: timestamp("submitted_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  pinHash: true,
}).extend({
  role: z.enum(['employee', 'manager', 'admin']).default('employee'),
  pin: z.string().regex(/^\d{4,5}$/, "PIN must be 4-5 digits"),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['employee', 'manager', 'admin']).optional(),
  active: z.boolean().optional(),
  pin: z.string().regex(/^\d{4,5}$/, "PIN must be 4-5 digits").optional(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
}).extend({
  startingCash: z.preprocess((val) => String(val), z.string()),
  tolerance: z.preprocess((val) => String(val), z.string()),
  googleSheetId: z.string().optional(),
  companyLogo: z.string().optional(),
});

export const insertReconciliationSchema = createInsertSchema(reconciliations).omit({
  id: true,
  createdAt: true,
}).extend({
  cashSales: z.preprocess((val) => String(val), z.string()),
  checkSales: z.preprocess((val) => String(val), z.string()),
  cashOut: z.preprocess((val) => String(val), z.string()),
  startingCash: z.preprocess((val) => String(val), z.string()),
  cashCount: z.preprocess((val) => String(val), z.string()),
  expectedCash: z.preprocess((val) => String(val), z.string()),
  difference: z.preprocess((val) => String(val), z.string()),
  check1Amount: z.preprocess((val) => val ? String(val) : '0.00', z.string().optional()),
  check2Amount: z.preprocess((val) => val ? String(val) : '0.00', z.string().optional()),
  check3Amount: z.preprocess((val) => val ? String(val) : '0.00', z.string().optional()),
});

export type Employee = typeof employees.$inferSelect;
export type PublicEmployee = Omit<Employee, 'pinHash'>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Reconciliation = typeof reconciliations.$inferSelect;
export type InsertReconciliation = z.infer<typeof insertReconciliationSchema>;
