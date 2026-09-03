import session from "express-session";
import connectPg from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import type { Express, RequestHandler } from "express";
import { pool } from "./db";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    employeeId?: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// A 4-5 digit PIN has a small keyspace, so the login endpoint is rate
// limited per-IP to make brute-forcing impractical.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.get("/api/auth/employees", async (_req, res) => {
    try {
      const employees = await storage.getActiveEmployees();
      res.json(employees.map(({ id, name }) => ({ id, name })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    try {
      const { employeeId, pin } = req.body;
      if (!employeeId || !pin) {
        return res.status(400).json({ message: "Employee and PIN are required" });
      }

      const employee = await storage.verifyPin(employeeId, pin);
      if (!employee) {
        return res.status(401).json({ message: "Incorrect PIN" });
      }

      req.session.employeeId = employee.id;
      res.json({ id: employee.id, name: employee.name, role: employee.role });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.employeeId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const employee = await storage.getEmployee(req.session.employeeId);
    if (!employee || !employee.active) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ id: employee.id, name: employee.name, role: employee.role });
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session.employeeId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const employee = await storage.getEmployee(req.session.employeeId);
  if (!employee || !employee.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.employee = employee;
  next();
};

export function requireRole(roles: string[]): RequestHandler {
  return (req: any, res, next) => {
    if (!req.employee || !roles.includes(req.employee.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
