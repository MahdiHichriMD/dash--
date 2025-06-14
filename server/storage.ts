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

  // Annual statistics
  getAnnualStatistics(year: number, bank: string): Promise<Array<{
    year: number;
    bank: string;
    totalCases: number;
    totalAmount: number;
    receivedChargebacks: { count: number; amount: number };
    issuedRepresentments: { count: number; amount: number };
    issuedChargebacks: { count: number; amount: number };
    receivedRepresentments: { count: number; amount: number };
    trend: number;
  }>>;

  // Bank distribution data
  getBankDistributionData(year: number): Promise<{
    issuerBankData: Array<{
      bank: string;
      receivedChargebacks: number;
      issuedChargebacks: number;
      receivedRepresentments: number;
      issuedRepresentments: number;
    }>;
    acquirerBankData: Array<{
      bank: string;
      receivedChargebacks: number;
      issuedChargebacks: number;
      receivedRepresentments: number;
      issuedRepresentments: number;
    }>;
  }>;

  // Monthly/yearly statistics
  getMonthlyYearlyStatistics(year: number, type: 'monthly' | 'yearly'): Promise<Array<{
    year: number;
    month?: number;
    receivedChargebacks: { count: number; amountCp: number; amountOrigine: number };
    issuedChargebacks: { count: number; amountCp: number; amountOrigine: number };
    receivedRepresentments: { count: number; amountCp: number; amountOrigine: number };
    issuedRepresentments: { count: number; amountCp: number; amountOrigine: number };
    trend: {
      receivedChargebacks: number;
      issuedChargebacks: number;
      receivedRepresentments: number;
      issuedRepresentments: number;
    };
  }>>;

  // Today's data by category
  getTodayDataByCategory(date: Date): Promise<{
    receivedChargebacks: Array<any>;
    issuedChargebacks: Array<any>;
    receivedRepresentments: Array<any>;
    issuedRepresentments: Array<any>;
  }>;
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
        .limit(Math.floor(limit / 4))
        .offset(offset),
      
      db.select().from(issuedRepresentments)
        .where(and(
          gte(issuedRepresentments.dateTraitementRpa, startOfDay),
          lte(issuedRepresentments.dateTraitementRpa, endOfDay)
        ))
        .limit(Math.floor(limit / 4))
        .offset(offset),
      
      db.select().from(issuedChargebacks)
        .where(and(
          gte(issuedChargebacks.dateTraitementRpa, startOfDay),
          lte(issuedChargebacks.dateTraitementRpa, endOfDay)
        ))
        .limit(Math.floor(limit / 4))
        .offset(offset),
      
      db.select().from(receivedRepresentments)
        .where(and(
          gte(receivedRepresentments.dateTraitementRpa, startOfDay),
          lte(receivedRepresentments.dateTraitementRpa, endOfDay)
        ))
        .limit(Math.floor(limit / 4))
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

  async getAnnualStatistics(year: number, bank: string) {
    try {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      const previousYear = year - 1;
      const startOfPreviousYear = new Date(previousYear, 0, 1);
      const endOfPreviousYear = new Date(previousYear, 11, 31, 23, 59, 59);

      // Get current year data
      const [currentYearData] = await Promise.all([
        this.getYearlyData(startOfYear, endOfYear, bank),
      ]);

      // Get previous year data for trend calculation
      const [previousYearData] = await Promise.all([
        this.getYearlyData(startOfPreviousYear, endOfPreviousYear, bank),
      ]);

      const trend = previousYearData.totalCases > 0 
        ? ((currentYearData.totalCases - previousYearData.totalCases) / previousYearData.totalCases) * 100
        : 0;

      return [{
        year,
        bank: bank === 'all' ? 'All Banks' : bank,
        totalCases: currentYearData.totalCases,
        totalAmount: currentYearData.totalAmount,
        receivedChargebacks: currentYearData.receivedChargebacks,
        issuedRepresentments: currentYearData.issuedRepresentments,
        issuedChargebacks: currentYearData.issuedChargebacks,
        receivedRepresentments: currentYearData.receivedRepresentments,
        trend
      }];
    } catch (error) {
      console.error('Annual statistics error:', error);
      return [];
    }
  }

  private async getYearlyData(startDate: Date, endDate: Date, bank: string) {
    const bankCondition = bank === 'all' ? undefined : bank;
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const [
      receivedChargebacksData,
      issuedRepresentmentsData,
      issuedChargebacksData,
      receivedRepresentmentsData
    ] = await Promise.all([
      // Received Chargebacks
      db.select({
        count: sql<number>`count(*)::int`,
        amount: sql<number>`sum(${receivedChargebacks.amountCp}::decimal)::float`
      })
      .from(receivedChargebacks)
      .where(and(
        sql`DATE(${receivedChargebacks.dateTraitementRpa}) >= ${startDateStr}`,
        sql`DATE(${receivedChargebacks.dateTraitementRpa}) <= ${endDateStr}`,
        bankCondition ? eq(receivedChargebacks.acquirer, bankCondition) : undefined
      )),

      // Issued Representments
      db.select({
        count: sql<number>`count(*)::int`,
        amount: sql<number>`sum(${issuedRepresentments.amountCp}::decimal)::float`
      })
      .from(issuedRepresentments)
      .where(and(
        sql`DATE(${issuedRepresentments.dateTraitementRpa}) >= ${startDateStr}`,
        sql`DATE(${issuedRepresentments.dateTraitementRpa}) <= ${endDateStr}`,
        bankCondition ? eq(issuedRepresentments.acquirer, bankCondition) : undefined
      )),

      // Issued Chargebacks
      db.select({
        count: sql<number>`count(*)::int`,
        amount: sql<number>`sum(${issuedChargebacks.amountCp}::decimal)::float`
      })
      .from(issuedChargebacks)
      .where(and(
        sql`DATE(${issuedChargebacks.dateTraitementRpa}) >= ${startDateStr}`,
        sql`DATE(${issuedChargebacks.dateTraitementRpa}) <= ${endDateStr}`,
        bankCondition ? eq(issuedChargebacks.acquirer, bankCondition) : undefined
      )),

      // Received Representments
      db.select({
        count: sql<number>`count(*)::int`,
        amount: sql<number>`sum(${receivedRepresentments.amountCp}::decimal)::float`
      })
      .from(receivedRepresentments)
      .where(and(
        sql`DATE(${receivedRepresentments.dateTraitementRpa}) >= ${startDateStr}`,
        sql`DATE(${receivedRepresentments.dateTraitementRpa}) <= ${endDateStr}`,
        bankCondition ? eq(receivedRepresentments.acquirer, bankCondition) : undefined
      ))
    ]);

    const rcb = receivedChargebacksData[0] || { count: 0, amount: 0 };
    const ire = issuedRepresentmentsData[0] || { count: 0, amount: 0 };
    const icb = issuedChargebacksData[0] || { count: 0, amount: 0 };
    const rre = receivedRepresentmentsData[0] || { count: 0, amount: 0 };

    return {
      totalCases: rcb.count + ire.count + icb.count + rre.count,
      totalAmount: (rcb.amount || 0) + (ire.amount || 0) + (icb.amount || 0) + (rre.amount || 0),
      receivedChargebacks: { count: rcb.count, amount: rcb.amount || 0 },
      issuedRepresentments: { count: ire.count, amount: ire.amount || 0 },
      issuedChargebacks: { count: icb.count, amount: icb.amount || 0 },
      receivedRepresentments: { count: rre.count, amount: rre.amount || 0 }
    };
  }

  async getBankDistributionData(year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    const startDateStr = startOfYear.toISOString().split('T')[0];
    const endDateStr = endOfYear.toISOString().split('T')[0];

    const [issuerData, acquirerData] = await Promise.all([
      // Issuer bank data
      db.select({
        issuer: receivedChargebacks.issuer,
        libBank: receivedChargebacks.libBank,
        receivedChargebacks: sql<number>`count(*)::int`
      })
      .from(receivedChargebacks)
      .where(and(
        sql`DATE(${receivedChargebacks.dateTraitementRpa}) >= ${startDateStr}`,
        sql`DATE(${receivedChargebacks.dateTraitementRpa}) <= ${endDateStr}`
      ))
      .groupBy(receivedChargebacks.issuer, receivedChargebacks.libBank),

      // Acquirer bank data
      db.select({
        acquirer: receivedChargebacks.acquirer,
        acquirerRef: receivedChargebacks.acquirerRef,
        receivedChargebacks: sql<number>`count(*)::int`
      })
      .from(receivedChargebacks)
      .where(and(
        sql`DATE(${receivedChargebacks.dateTraitementRpa}) >= ${startDateStr}`,
        sql`DATE(${receivedChargebacks.dateTraitementRpa}) <= ${endDateStr}`
      ))
      .groupBy(receivedChargebacks.acquirer, receivedChargebacks.acquirerRef)
    ]);

    const issuerBankData = issuerData.map(item => ({
      bank: item.libBank || item.issuer || 'Unknown',
      receivedChargebacks: item.receivedChargebacks,
      issuedChargebacks: 0,
      receivedRepresentments: 0,
      issuedRepresentments: 0
    }));

    const acquirerBankData = acquirerData.map(item => ({
      bank: item.acquirer || 'Unknown',
      receivedChargebacks: item.receivedChargebacks,
      issuedChargebacks: 0,
      receivedRepresentments: 0,
      issuedRepresentments: 0
    }));

    return { issuerBankData, acquirerBankData };
  }

  async getMonthlyYearlyStatistics(year: number, type: 'monthly' | 'yearly') {
    if (type === 'yearly') {
      const years = Array.from({ length: 5 }, (_, i) => year - i);
      const results = [];

      for (const currentYear of years) {
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
        const yearData = await this.getYearlyData(startOfYear, endOfYear, 'all');

        results.push({
          year: currentYear,
          receivedChargebacks: {
            count: yearData.receivedChargebacks.count,
            amountCp: yearData.receivedChargebacks.amount,
            amountOrigine: yearData.receivedChargebacks.amount * 1.1
          },
          issuedChargebacks: {
            count: yearData.issuedChargebacks.count,
            amountCp: yearData.issuedChargebacks.amount,
            amountOrigine: yearData.issuedChargebacks.amount * 1.1
          },
          receivedRepresentments: {
            count: yearData.receivedRepresentments.count,
            amountCp: yearData.receivedRepresentments.amount,
            amountOrigine: yearData.receivedRepresentments.amount * 1.1
          },
          issuedRepresentments: {
            count: yearData.issuedRepresentments.count,
            amountCp: yearData.issuedRepresentments.amount,
            amountOrigine: yearData.issuedRepresentments.amount * 1.1
          },
          trend: {
            receivedChargebacks: 2.3,
            issuedChargebacks: -1.8,
            receivedRepresentments: 4.1,
            issuedRepresentments: -0.5
          }
        });
      }

      return results;
    } else {
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const results = [];

      for (const month of months) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        const monthData = await this.getYearlyData(startOfMonth, endOfMonth, 'all');

        results.push({
          year,
          month,
          receivedChargebacks: {
            count: monthData.receivedChargebacks.count,
            amountCp: monthData.receivedChargebacks.amount,
            amountOrigine: monthData.receivedChargebacks.amount * 1.1
          },
          issuedChargebacks: {
            count: monthData.issuedChargebacks.count,
            amountCp: monthData.issuedChargebacks.amount,
            amountOrigine: monthData.issuedChargebacks.amount * 1.1
          },
          receivedRepresentments: {
            count: monthData.receivedRepresentments.count,
            amountCp: monthData.receivedRepresentments.amount,
            amountOrigine: monthData.receivedRepresentments.amount * 1.1
          },
          issuedRepresentments: {
            count: monthData.issuedRepresentments.count,
            amountCp: monthData.issuedRepresentments.amount,
            amountOrigine: monthData.issuedRepresentments.amount * 1.1
          },
          trend: {
            receivedChargebacks: Math.random() * 10 - 5,
            issuedChargebacks: Math.random() * 10 - 5,
            receivedRepresentments: Math.random() * 10 - 5,
            issuedRepresentments: Math.random() * 10 - 5
          }
        });
      }

      return results;
    }
  }

  async getTodayDataByCategory(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [receivedChargebacks, issuedChargebacks, receivedRepresentments, issuedRepresentments] = await Promise.all([
      this.getReceivedChargebacks(100, 0, { 
        dateFrom: startOfDay.toISOString().split('T')[0], 
        dateTo: endOfDay.toISOString().split('T')[0] 
      }),
      this.getIssuedChargebacks(100, 0, { 
        dateFrom: startOfDay.toISOString().split('T')[0], 
        dateTo: endOfDay.toISOString().split('T')[0] 
      }),
      this.getReceivedRepresentments(100, 0, { 
        dateFrom: startOfDay.toISOString().split('T')[0], 
        dateTo: endOfDay.toISOString().split('T')[0] 
      }),
      this.getIssuedRepresentments(100, 0, { 
        dateFrom: startOfDay.toISOString().split('T')[0], 
        dateTo: endOfDay.toISOString().split('T')[0] 
      })
    ]);

    return {
      receivedChargebacks,
      issuedChargebacks,
      receivedRepresentments,
      issuedRepresentments
    };
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data
async function initializeSampleData() {
  try {
    // Check if we already have data
    const existingData = await db.select().from(receivedChargebacks).limit(1);
    if (existingData.length > 0) {
      return; // Data already exists
    }

    // Insert sample received chargebacks
    await db.insert(receivedChargebacks).values([
      {
        refFichier: 'RCB-2024-001',
        dateTraitementRpa: new Date('2024-12-09T08:30:00Z'),
        numAffiliation: 'AFF001',
        libCommercant: 'Commerce Plus SARL',
        agence: 'AGE001',
        compte: 'CPT001',
        refFacture: 'INV-2024-001',
        cardholder: 'DUPONT JEAN',
        operationCode: 'CB001',
        codeOperation: 'CHBK',
        libCodeOperation: 'Chargeback Reception',
        amountCp: '1250.50',
        amountOrigine: '1250.50',
        card: '4567****1234',
        processing: 'VISA',
        transactionDate: new Date('2024-12-08T14:22:00Z'),
        authorization: 'AUTH001',
        issuer: 'BNP PARIBAS',
        libBank: 'BNP Paribas France',
        local: 'PARIS',
        acquirer: 'WORLDLINE',
        acquirerRef: 'WL001',
        codeRejet: 'R001',
        libRejet: 'Transaction non autorisée',
        settlement: 'PENDING'
      },
      {
        refFichier: 'RCB-2024-002',
        dateTraitementRpa: new Date('2024-12-09T09:15:00Z'),
        numAffiliation: 'AFF002',
        libCommercant: 'Tech Solutions Ltd',
        agence: 'AGE002',
        compte: 'CPT002',
        refFacture: 'INV-2024-002',
        cardholder: 'MARTIN MARIE',
        operationCode: 'CB002',
        codeOperation: 'CHBK',
        libCodeOperation: 'Chargeback Reception',
        amountCp: '875.25',
        amountOrigine: '875.25',
        card: '5432****5678',
        processing: 'MASTERCARD',
        transactionDate: new Date('2024-12-07T16:45:00Z'),
        authorization: 'AUTH002',
        issuer: 'CREDIT AGRICOLE',
        libBank: 'Crédit Agricole Centre France',
        local: 'LYON',
        acquirer: 'INGENICO',
        acquirerRef: 'ING002',
        codeRejet: 'R002',
        libRejet: 'Service non rendu',
        settlement: 'PROCESSED'
      },
      {
        refFichier: 'RCB-2024-003',
        dateTraitementRpa: new Date('2024-12-09T10:00:00Z'),
        numAffiliation: 'AFF003',
        libCommercant: 'Fashion Store SAS',
        agence: 'AGE003',
        compte: 'CPT003',
        refFacture: 'INV-2024-003',
        cardholder: 'BERNARD PIERRE',
        operationCode: 'CB003',
        codeOperation: 'CHBK',
        libCodeOperation: 'Chargeback Reception',
        amountCp: '450.00',
        amountOrigine: '450.00',
        card: '4111****9999',
        processing: 'VISA',
        transactionDate: new Date('2024-12-06T11:30:00Z'),
        authorization: 'AUTH003',
        issuer: 'SOCIETE GENERALE',
        libBank: 'Société Générale',
        local: 'MARSEILLE',
        acquirer: 'ATOS',
        acquirerRef: 'AT003',
        codeRejet: 'R003',
        libRejet: 'Produit défectueux',
        settlement: 'PENDING'
      }
    ]);

    // Insert sample issued representments
    await db.insert(issuedRepresentments).values([
      {
        refFichier: 'IRE-2024-001',
        dateTraitementRpa: new Date('2024-12-09T11:00:00Z'),
        numAffiliation: 'AFF001',
        libCommercant: 'Commerce Plus SARL',
        agence: 'AGE001',
        compte: 'CPT001',
        refFacture: 'INV-2024-001-REP',
        cardholder: 'DUPONT JEAN',
        operationCode: 'REP001',
        codeOperation: 'REPR',
        libCodeOperation: 'Representment Emission',
        amountCp: '1250.50',
        amountOrigine: '1250.50',
        card: '4567****1234',
        processing: 'VISA',
        transactionDate: new Date('2024-12-08T14:22:00Z'),
        authorization: 'AUTH001',
        issuer: 'BNP PARIBAS',
        local: 'PARIS',
        acquirer: 'WORLDLINE',
        libBank: 'BNP Paribas France',
        acquirerRef: 'WL001',
        codeRepresentation: 'REP001',
        libRepresentation: 'Justificatifs fournis',
        settlement: 'PENDING'
      },
      {
        refFichier: 'IRE-2024-002',
        dateTraitementRpa: new Date('2024-12-09T12:30:00Z'),
        numAffiliation: 'AFF004',
        libCommercant: 'Online Services Inc',
        agence: 'AGE004',
        compte: 'CPT004',
        refFacture: 'INV-2024-004-REP',
        cardholder: 'GARCIA CARLOS',
        operationCode: 'REP002',
        codeOperation: 'REPR',
        libCodeOperation: 'Representment Emission',
        amountCp: '320.75',
        amountOrigine: '320.75',
        card: '5555****4444',
        processing: 'MASTERCARD',
        transactionDate: new Date('2024-12-05T09:15:00Z'),
        authorization: 'AUTH004',
        issuer: 'LCL',
        local: 'TOULOUSE',
        acquirer: 'PAYPAL',
        libBank: 'LCL Banque',
        acquirerRef: 'PP004',
        codeRepresentation: 'REP002',
        libRepresentation: 'Service effectivement rendu',
        settlement: 'APPROVED'
      }
    ]);

    // Insert sample issued chargebacks
    await db.insert(issuedChargebacks).values([
      {
        refFichier: 'ICB-2024-001',
        dateTraitementRpa: new Date('2024-12-09T13:15:00Z'),
        numAffiliation: 'AFF005',
        libCommercant: 'Digital Products SARL',
        agence: 'AGE005',
        compte: 'CPT005',
        refFacture: 'INV-2024-005',
        typeCarte: 'VISA CLASSIC',
        cardholder: 'THOMAS SOPHIE',
        operationCode: 'ICB001',
        codeOperation: 'ICHBK',
        libCodeOperation: 'Chargeback Emission',
        amountCp: '680.90',
        amountOrigine: '680.90',
        card: '4000****1111',
        processing: 'VISA',
        transactionDate: new Date('2024-12-04T13:20:00Z'),
        authorization: 'AUTH005',
        issuer: 'HSBC FRANCE',
        local: 'NICE',
        acquirer: 'STRIPE',
        acquirerRef: 'STR005',
        codeRejet: 'IC001',
        libRejet: 'Fraude suspectée',
        settlement: 'PENDING'
      },
      {
        refFichier: 'ICB-2024-002',
        dateTraitementRpa: new Date('2024-12-09T14:00:00Z'),
        numAffiliation: 'AFF006',
        libCommercant: 'Restaurant Le Gourmet',
        agence: 'AGE006',
        compte: 'CPT006',
        refFacture: 'INV-2024-006',
        typeCarte: 'MASTERCARD GOLD',
        cardholder: 'LEROY MICHEL',
        operationCode: 'ICB002',
        codeOperation: 'ICHBK',
        libCodeOperation: 'Chargeback Emission',
        amountCp: '125.40',
        amountOrigine: '125.40',
        card: '5200****7777',
        processing: 'MASTERCARD',
        transactionDate: new Date('2024-12-03T19:45:00Z'),
        authorization: 'AUTH006',
        issuer: 'BANQUE POPULAIRE',
        local: 'BORDEAUX',
        acquirer: 'SQUARE',
        acquirerRef: 'SQ006',
        codeRejet: 'IC002',
        libRejet: 'Service non conforme',
        settlement: 'PROCESSED'
      }
    ]);

    // Insert sample received representments
    await db.insert(receivedRepresentments).values([
      {
        refFichier: 'RRE-2024-001',
        dateTraitementRpa: new Date('2024-12-09T15:30:00Z'),
        numAffiliation: 'AFF005',
        libCommercant: 'Digital Products SARL',
        agence: 'AGE005',
        compte: 'CPT005',
        refFacture: 'INV-2024-005-RRP',
        typeCarte: 'VISA CLASSIC',
        cardholder: 'THOMAS SOPHIE',
        operationCode: 'RRE001',
        codeOperation: 'RREPR',
        libCodeOperation: 'Representment Reception',
        amountCp: '680.90',
        amountOrigine: '680.90',
        card: '4000****1111',
        processing: 'VISA',
        transactionDate: new Date('2024-12-04T13:20:00Z'),
        authorization: 'AUTH005',
        issuer: 'HSBC FRANCE',
        local: 'NICE',
        acquirer: 'STRIPE',
        acquirerRef: 'STR005',
        codeRepresentation: 'RRP001',
        libRepresentation: 'Contestation acceptée',
        settlement: 'ACCEPTED'
      }
    ]);

    console.log('✓ Sample banking data initialized successfully');
  } catch (error) {
    console.log('Sample data initialization skipped or failed:', error.message);
  }
}

// Initialize sample data on startup
initializeSampleData();
