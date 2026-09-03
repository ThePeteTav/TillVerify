import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReconciliationSchema, insertSettingsSchema, insertEmployeeSchema, updateEmployeeSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, requireRole } from "./auth";
import { generateReconciliationPDF, generateReconciliationExcel } from "./reportGenerator";
import { submitToGoogleSheets } from "./googleSheets";

const ADMIN_ROLES = ["admin", "manager"];

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // --- Employee management (admin/manager only) ---

  app.get("/api/employees", isAuthenticated, requireRole(ADMIN_ROLES), async (_req, res) => {
    try {
      const allEmployees = await storage.getAllEmployees();
      res.json(allEmployees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees", isAuthenticated, requireRole(ADMIN_ROLES), async (req, res) => {
    try {
      const validated = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validated);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/employees/:id", isAuthenticated, requireRole(ADMIN_ROLES), async (req, res) => {
    try {
      const validated = updateEmployeeSchema.parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, validated);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/employees/:id", isAuthenticated, requireRole(ADMIN_ROLES), async (req: any, res) => {
    try {
      if (req.params.id === req.employee.id) {
        return res.status(400).json({ error: "You cannot delete your own account" });
      }
      await storage.deleteEmployee(req.params.id);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Settings ---

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/settings", isAuthenticated, requireRole(ADMIN_ROLES), async (req, res) => {
    try {
      const validated = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validated);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Reconciliations ---

  app.post("/api/reconciliations", isAuthenticated, async (req: any, res) => {
    try {
      const employee = req.employee;

      const totalChecks = parseFloat(req.body.check1Amount || '0') + parseFloat(req.body.check2Amount || '0') + parseFloat(req.body.check3Amount || '0');
      const expectedDeposit = parseFloat(req.body.startingCash) + parseFloat(req.body.cashSales) + parseFloat(req.body.checkSales) - parseFloat(req.body.cashOut);
      const actualDeposit = parseFloat(req.body.cashCount) + totalChecks;
      const difference = actualDeposit - expectedDeposit;
      const expectedCash = parseFloat(req.body.startingCash) + parseFloat(req.body.cashSales) - parseFloat(req.body.cashOut);

      const validated = insertReconciliationSchema.parse({
        cashSales: req.body.cashSales,
        checkSales: req.body.checkSales,
        cashOut: req.body.cashOut,
        startingCash: req.body.startingCash,
        check1Date: req.body.check1Date || null,
        check1Number: req.body.check1Number || null,
        check1Name: req.body.check1Name || null,
        check1Amount: req.body.check1Amount || '0.00',
        check2Date: req.body.check2Date || null,
        check2Number: req.body.check2Number || null,
        check2Name: req.body.check2Name || null,
        check2Amount: req.body.check2Amount || '0.00',
        check3Date: req.body.check3Date || null,
        check3Number: req.body.check3Number || null,
        check3Name: req.body.check3Name || null,
        check3Amount: req.body.check3Amount || '0.00',
        hundreds: req.body.hundreds,
        fifties: req.body.fifties,
        twenties: req.body.twenties,
        tens: req.body.tens,
        fives: req.body.fives,
        ones: req.body.ones,
        quarters: req.body.quarters,
        dimes: req.body.dimes,
        nickels: req.body.nickels,
        pennies: req.body.pennies,
        cashCount: req.body.cashCount,
        expectedCash: expectedCash,
        difference: difference,
        notes: req.body.notes,
        status: req.body.status || 'completed',
        userId: employee.id,
        userName: employee.name,
      });

      const reconciliation = await storage.createReconciliation(validated);
      res.status(201).json(reconciliation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // All-history view: admin/manager only, since it spans every employee.
  app.get("/api/reconciliations", isAuthenticated, requireRole(ADMIN_ROLES), async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const reconciliations = await storage.getReconciliations(limit);
      res.json(reconciliations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reconciliations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reconciliation = await storage.getReconciliation(id);

      if (!reconciliation) {
        return res.status(404).json({ error: "Reconciliation not found" });
      }

      const isOwner = reconciliation.userId === req.employee.id;
      const isElevated = ADMIN_ROLES.includes(req.employee.role);
      if (!isOwner && !isElevated) {
        return res.status(403).json({ error: "Forbidden: You can only access your own reconciliations" });
      }

      res.json(reconciliation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Own history, or (for admin/manager) any employee's history.
  app.get("/api/reconciliations/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const isElevated = ADMIN_ROLES.includes(req.employee.role);
      if (req.params.userId !== req.employee.id && !isElevated) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const reconciliations = await storage.getReconciliationsByUser(req.params.userId);
      res.json(reconciliations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reconciliations/:id/pdf", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reconciliation = await storage.getReconciliation(id);

      if (!reconciliation) {
        return res.status(404).json({ error: "Reconciliation not found" });
      }

      const isOwner = reconciliation.userId === req.employee.id;
      const isElevated = ADMIN_ROLES.includes(req.employee.role);
      if (!isOwner && !isElevated) {
        return res.status(403).json({ error: "Forbidden: You can only access your own reconciliations" });
      }

      const settings = await storage.getSettings();
      const pdfBuffer = generateReconciliationPDF(reconciliation, settings);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reconciliation-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reconciliations/export/excel", isAuthenticated, async (req: any, res) => {
    try {
      const reconciliations = await storage.getReconciliationsByUser(req.employee.id);

      const excelBuffer = generateReconciliationExcel(reconciliations);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=my-reconciliations.xlsx`);
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // All-history export: admin/manager only.
  app.get("/api/reconciliations/export/excel/all", isAuthenticated, requireRole(ADMIN_ROLES), async (_req, res) => {
    try {
      const reconciliations = await storage.getReconciliations(10000);
      const excelBuffer = generateReconciliationExcel(reconciliations);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=all-reconciliations.xlsx`);
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reconciliations/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reconciliation = await storage.getReconciliation(id);

      if (!reconciliation) {
        return res.status(404).json({ error: "Reconciliation not found" });
      }

      if (reconciliation.userId !== req.employee.id) {
        return res.status(403).json({ error: "Forbidden: You can only submit your own reconciliations" });
      }

      if (reconciliation.isSubmitted) {
        return res.status(400).json({ error: "This reconciliation has already been submitted" });
      }

      const settings = await storage.getSettings();
      const spreadsheetId = settings?.googleSheetId;

      if (!spreadsheetId) {
        return res.status(400).json({ error: "Google Sheet ID not configured. Please configure it in settings." });
      }

      await submitToGoogleSheets(reconciliation, spreadsheetId);

      await storage.markReconciliationAsSubmitted(id);

      const updatedReconciliation = await storage.getReconciliation(id);
      res.json(updatedReconciliation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
