import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Log login
      await storage.createAuditLog({
        userId: user.id,
        action: "LOGIN",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          email: user.email 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Don't return password
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/daily-volumes", authenticateToken, async (req: any, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const volumes = await storage.getDailyVolumes(date);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_DAILY_VOLUMES",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(volumes);
    } catch (error) {
      console.error("Daily volumes error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/matching-records", authenticateToken, async (req: any, res) => {
    try {
      const matchingRecords = await storage.getMatchingRecords();
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_MATCHING_RECORDS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(matchingRecords);
    } catch (error) {
      console.error("Matching records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/today-cases", authenticateToken, async (req: any, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const cases = await storage.getTodayCases(date, limit, offset);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_TODAY_CASES",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(cases);
    } catch (error) {
      console.error("Today cases error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/top-issuers", authenticateToken, async (req: any, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const limit = parseInt(req.query.limit as string) || 5;
      
      const topIssuers = await storage.getTopIssuers(date, limit);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_TOP_ISSUERS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(topIssuers);
    } catch (error) {
      console.error("Top issuers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/top-acquirers", authenticateToken, async (req: any, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const limit = parseInt(req.query.limit as string) || 5;
      
      const topAcquirers = await storage.getTopAcquirers(date, limit);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_TOP_ACQUIRERS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(topAcquirers);
    } catch (error) {
      console.error("Top acquirers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/volume-history", authenticateToken, async (req: any, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      
      const volumeHistory = await storage.getVolumeHistory(days);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_VOLUME_HISTORY",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(volumeHistory);
    } catch (error) {
      console.error("Volume history error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/annual-statistics", authenticateToken, async (req: any, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const bank = req.query.bank as string || "all";
      
      const stats = await storage.getAnnualStatistics(year, bank);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_ANNUAL_STATISTICS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(stats);
    } catch (error) {
      console.error("Annual statistics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Data table routes
  app.get("/api/received-chargebacks", authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const chargebacks = await storage.getReceivedChargebacks(limit, offset);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_RECEIVED_CHARGEBACKS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(chargebacks);
    } catch (error) {
      console.error("Received chargebacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/issued-representments", authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const representments = await storage.getIssuedRepresentments(limit, offset);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_ISSUED_REPRESENTMENTS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(representments);
    } catch (error) {
      console.error("Issued representments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/issued-chargebacks", authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const chargebacks = await storage.getIssuedChargebacks(limit, offset);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_ISSUED_CHARGEBACKS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(chargebacks);
    } catch (error) {
      console.error("Issued chargebacks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/received-representments", authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const representments = await storage.getReceivedRepresentments(limit, offset);
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "VIEW_RECEIVED_REPRESENTMENTS",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(representments);
    } catch (error) {
      console.error("Received representments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
