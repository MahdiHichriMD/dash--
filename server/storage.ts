import { 
  users, 
  receivedChargebacks, 
  issuedRepresentments, 
  issuedChargebacks, 
  receivedRepresentments,
  auditLog,
  type User, 
  type InsertUser,
  type ReceivedChargeback,
  type InsertReceivedChargeback,
  type IssuedRepresentment,
  type InsertIssuedRepresentment,
  type IssuedChargeback,
  type InsertIssuedChargeback,
  type ReceivedRepresentment,
  type InsertReceivedRepresentment,
  type AuditLog,
  type InsertAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Dashboard methods
  getDailyVolumes(date: Date): Promise<{
    receivedChargebacks: { count: number; amount: string };
    issuedRepresentments: { count: number; amount: string };
    issuedChargebacks: { count: number; amount: string };
    receivedRepresentments: { count: number; amount: string };
  }>;
  
  getMatchingRecords(): Promise<{
    receivedChargebacksLinked: number;
    receivedChargebacksTotal: number;
    issuedChargebacksLinked: number;
    issuedChargebacksTotal: number;
  }>;

  getTodayCases(date: Date, limit?: number, offset?: number): Promise<any[]>;
  
  getTopIssuers(date: Date, limit?: number): Promise<Array<{
    issuer: string;
    libBank: string;
    volume: string;
    count: number;
  }>>;

  getTopAcquirers(date: Date, limit?: number): Promise<Array<{
    acquirer: string;
    acquirerRef: string;
    volume: string;
    count: number;
  }>>;

  getVolumeHistory(days: number): Promise<Array<{
    date: string;
    receivedChargebacks: number;
    issuedRepresentments: number;
    issuedChargebacks: number;
    receivedRepresentments: number;
  }>>;

  // CRUD methods for each table
  getReceivedChargebacks(limit?: number, offset?: number, filters?: any): Promise<ReceivedChargeback[]>;
  getIssuedRepresentments(limit?: number, offset?: number, filters?: any): Promise<IssuedRepresentment[]>;
  getIssuedChargebacks(limit?: number, offset?: number, filters?: any): Promise<IssuedChargeback[]>;
  getReceivedRepresentments(limit?: number, offset?: number, filters?: any): Promise<ReceivedRepresentment[]>;

  // Audit logging
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDailyVolumes(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [receivedCB, issuedRep, issuedCB, receivedRep] = await Promise.all([
      db.select({
        count: count(),
        amount: sum(receivedChargebacks.amountCp)
      }).from(receivedChargebacks)
      .where(and(
        gte(receivedChargebacks.dateTraitementRpa, startOfDay),
        lte(receivedChargebacks.dateTraitementRpa, endOfDay)
      )),
      
      db.select({
        count: count(),
        amount: sum(issuedRepresentments.amountCp)
      }).from(issuedRepresentments)
      .where(and(
        gte(issuedRepresentments.dateTraitementRpa, startOfDay),
        lte(issuedRepresentments.dateTraitementRpa, endOfDay)
      )),
      
      db.select({
        count: count(),
        amount: sum(issuedChargebacks.amountCp)
      }).from(issuedChargebacks)
      .where(and(
        gte(issuedChargebacks.dateTraitementRpa, startOfDay),
        lte(issuedChargebacks.dateTraitementRpa, endOfDay)
      )),
      
      db.select({
        count: count(),
        amount: sum(receivedRepresentments.amountCp)
      }).from(receivedRepresentments)
      .where(and(
        gte(receivedRepresentments.dateTraitementRpa, startOfDay),
        lte(receivedRepresentments.dateTraitementRpa, endOfDay)
      ))
    ]);

    return {
      receivedChargebacks: { 
        count: receivedCB[0]?.count || 0, 
        amount: receivedCB[0]?.amount || "0" 
      },
      issuedRepresentments: { 
        count: issuedRep[0]?.count || 0, 
        amount: issuedRep[0]?.amount || "0" 
      },
      issuedChargebacks: { 
        count: issuedCB[0]?.count || 0, 
        amount: issuedCB[0]?.amount || "0" 
      },
      receivedRepresentments: { 
        count: receivedRep[0]?.count || 0, 
        amount: receivedRep[0]?.amount || "0" 
      }
    };
  }

  async getMatchingRecords() {
    // Get total counts
    const [receivedCBTotal] = await db.select({ count: count() }).from(receivedChargebacks);
    const [issuedCBTotal] = await db.select({ count: count() }).from(issuedChargebacks);

    // Get linked counts using composite key matching
    const [receivedCBLinked] = await db.select({ count: count() })
      .from(receivedChargebacks)
      .innerJoin(
        issuedRepresentments,
        and(
          eq(receivedChargebacks.numAffiliation, issuedRepresentments.numAffiliation),
          eq(receivedChargebacks.agence, issuedRepresentments.agence),
          eq(receivedChargebacks.compte, issuedRepresentments.compte),
          eq(receivedChargebacks.authorization, issuedRepresentments.authorization),
          eq(receivedChargebacks.acquirerRef, issuedRepresentments.acquirerRef)
        )
      );

    const [issuedCBLinked] = await db.select({ count: count() })
      .from(issuedChargebacks)
      .innerJoin(
        receivedRepresentments,
        and(
          eq(issuedChargebacks.numAffiliation, receivedRepresentments.numAffiliation),
          eq(issuedChargebacks.agence, receivedRepresentments.agence),
          eq(issuedChargebacks.compte, receivedRepresentments.compte),
          eq(issuedChargebacks.authorization, receivedRepresentments.authorization),
          eq(issuedChargebacks.acquirerRef, receivedRepresentments.acquirerRef)
        )
      );

    return {
      receivedChargebacksLinked: receivedCBLinked.count || 0,
      receivedChargebacksTotal: receivedCBTotal.count || 0,
      issuedChargebacksLinked: issuedCBLinked.count || 0,
      issuedChargebacksTotal: issuedCBTotal.count || 0
    };
  }

  async getTodayCases(date: Date, limit = 50, offset = 0) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all today's cases from all tables
    const cases = await Promise.all([
      db.select().from(receivedChargebacks)
        .where(and(
          gte(receivedChargebacks.dateTraitementRpa, startOfDay),
          lte(receivedChargebacks.dateTraitementRpa, endOfDay)
        ))
        .limit(limit / 4)
        .offset(offset),
      
      db.select().from(issuedRepresentments)
        .where(and(
          gte(issuedRepresentments.dateTraitementRpa, startOfDay),
          lte(issuedRepresentments.dateTraitementRpa, endOfDay)
        ))
        .limit(limit / 4)
        .offset(offset),
      
      db.select().from(issuedChargebacks)
        .where(and(
          gte(issuedChargebacks.dateTraitementRpa, startOfDay),
          lte(issuedChargebacks.dateTraitementRpa, endOfDay)
        ))
        .limit(limit / 4)
        .offset(offset),
      
      db.select().from(receivedRepresentments)
        .where(and(
          gte(receivedRepresentments.dateTraitementRpa, startOfDay),
          lte(receivedRepresentments.dateTraitementRpa, endOfDay)
        ))
        .limit(limit / 4)
        .offset(offset)
    ]);

    // Combine and format cases
    const allCases = [
      ...cases[0].map(c => ({ ...c, type: 'received_chargeback' })),
      ...cases[1].map(c => ({ ...c, type: 'issued_representment' })),
      ...cases[2].map(c => ({ ...c, type: 'issued_chargeback' })),
      ...cases[3].map(c => ({ ...c, type: 'received_representment' }))
    ];

    return allCases.sort((a, b) => 
      new Date(b.dateTraitementRpa).getTime() - new Date(a.dateTraitementRpa).getTime()
    );
  }

  async getTopIssuers(date: Date, limit = 5) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.select({
      issuer: receivedChargebacks.issuer,
      libBank: receivedChargebacks.libBank,
      volume: sum(receivedChargebacks.amountCp),
      count: count()
    })
    .from(receivedChargebacks)
    .where(and(
      gte(receivedChargebacks.dateTraitementRpa, startOfDay),
      lte(receivedChargebacks.dateTraitementRpa, endOfDay)
    ))
    .groupBy(receivedChargebacks.issuer, receivedChargebacks.libBank)
    .orderBy(desc(sum(receivedChargebacks.amountCp)))
    .limit(limit);

    return result.map(r => ({
      issuer: r.issuer || '',
      libBank: r.libBank || '',
      volume: r.volume || '0',
      count: r.count || 0
    }));
  }

  async getTopAcquirers(date: Date, limit = 5) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.select({
      acquirer: receivedChargebacks.acquirer,
      acquirerRef: receivedChargebacks.acquirerRef,
      volume: sum(receivedChargebacks.amountCp),
      count: count()
    })
    .from(receivedChargebacks)
    .where(and(
      gte(receivedChargebacks.dateTraitementRpa, startOfDay),
      lte(receivedChargebacks.dateTraitementRpa, endOfDay)
    ))
    .groupBy(receivedChargebacks.acquirer, receivedChargebacks.acquirerRef)
    .orderBy(desc(sum(receivedChargebacks.amountCp)))
    .limit(limit);

    return result.map(r => ({
      acquirer: r.acquirer || '',
      acquirerRef: r.acquirerRef || '',
      volume: r.volume || '0',
      count: r.count || 0
    }));
  }

  async getVolumeHistory(days: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // This is a simplified implementation - in a real scenario you'd want to aggregate by day
    const results = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const volumes = await this.getDailyVolumes(date);
      results.push({
        date: date.toISOString().split('T')[0],
        receivedChargebacks: volumes.receivedChargebacks.count,
        issuedRepresentments: volumes.issuedRepresentments.count,
        issuedChargebacks: volumes.issuedChargebacks.count,
        receivedRepresentments: volumes.receivedRepresentments.count
      });
    }

    return results;
  }

  async getReceivedChargebacks(limit = 50, offset = 0, filters = {}) {
    return await db.select().from(receivedChargebacks)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(receivedChargebacks.dateTraitementRpa));
  }

  async getIssuedRepresentments(limit = 50, offset = 0, filters = {}) {
    return await db.select().from(issuedRepresentments)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(issuedRepresentments.dateTraitementRpa));
  }

  async getIssuedChargebacks(limit = 50, offset = 0, filters = {}) {
    return await db.select().from(issuedChargebacks)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(issuedChargebacks.dateTraitementRpa));
  }

  async getReceivedRepresentments(limit = 50, offset = 0, filters = {}) {
    return await db.select().from(receivedRepresentments)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(receivedRepresentments.dateTraitementRpa));
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLog)
      .values(insertLog)
      .returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
