import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReconciliationSchema, insertSettingsSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateReconciliationPDF, generateReconciliationExcel } from "./reportGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const validated = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validated);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/reconciliations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const userId = user.claims.sub;
      const dbUser = await storage.getUser(userId);
      
      const expectedCash = parseFloat(req.body.startingCash) + parseFloat(req.body.cashSales) - parseFloat(req.body.cashOut);
      const difference = parseFloat(req.body.cashCount) - expectedCash;
      
      const validated = insertReconciliationSchema.parse({
        totalSales: req.body.totalSales,
        cashSales: req.body.cashSales,
        cardSales: req.body.cardSales,
        cashOut: req.body.cashOut,
        startingCash: req.body.startingCash,
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
        userId: userId,
        userName: dbUser?.firstName || dbUser?.email || 'Employee',
        userEmail: dbUser?.email || 'unknown',
      });
      
      const reconciliation = await storage.createReconciliation(validated);
      res.status(201).json(reconciliation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/reconciliations", isAuthenticated, async (req, res) => {
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
      const userId = req.user.claims.sub;
      const reconciliation = await storage.getReconciliation(id);
      
      if (!reconciliation) {
        return res.status(404).json({ error: "Reconciliation not found" });
      }
      
      if (reconciliation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You can only access your own reconciliations" });
      }
      
      res.json(reconciliation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reconciliations/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const reconciliations = await storage.getReconciliationsByUser(req.params.userId);
      res.json(reconciliations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reconciliations/:id/pdf", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const reconciliation = await storage.getReconciliation(id);
      
      if (!reconciliation) {
        return res.status(404).json({ error: "Reconciliation not found" });
      }
      
      if (reconciliation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You can only access your own reconciliations" });
      }
      
      const pdfBuffer = generateReconciliationPDF(reconciliation);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reconciliation-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reconciliations/export/excel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reconciliations = await storage.getReconciliationsByUser(userId);
      
      const excelBuffer = generateReconciliationExcel(reconciliations);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=my-reconciliations.xlsx`);
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
