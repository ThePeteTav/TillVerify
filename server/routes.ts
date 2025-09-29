import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReconciliationSchema, insertSettingsSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
      
      const validated = insertReconciliationSchema.parse({
        ...req.body,
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

  app.get("/api/reconciliations/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reconciliation = await storage.getReconciliation(id);
      
      if (!reconciliation) {
        return res.status(404).json({ error: "Reconciliation not found" });
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

  const httpServer = createServer(app);

  return httpServer;
}
