import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("analyst"),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Received Chargebacks table
export const receivedChargebacks = pgTable("received_chargebacks", {
  id: serial("id").primaryKey(),
  refFichier: text("ref_fichier").notNull(),
  dateTraitementRpa: timestamp("date_traitement_rpa").notNull(),
  numAffiliation: text("num_affiliation").notNull(),
  libCommercant: text("lib_commercant").notNull(),
  agence: text("agence").notNull(),
  compte: text("compte").notNull(),
  refFacture: text("ref_facture"),
  cardholder: text("cardholder"),
  operationCode: text("operation_code"),
  codeOperation: text("code_operation"),
  libCodeOperation: text("lib_code_operation"),
  amountCp: decimal("amount_cp", { precision: 12, scale: 2 }).notNull(),
  amountOrigine: decimal("amount_origine", { precision: 12, scale: 2 }).notNull(),
  card: text("card"),
  processing: text("processing"),
  transactionDate: timestamp("transaction_date").notNull(),
  authorization: text("authorization").notNull(),
  issuer: text("issuer"),
  libBank: text("lib_bank"),
  local: text("local"),
  acquirer: text("acquirer"),
  acquirerRef: text("acquirer_ref").notNull(),
  codeRejet: text("code_rejet"),
  libRejet: text("lib_rejet"),
  settlement: text("settlement"),
  sortEnvoi: text("sort_envoi"),
  dateReceptionJustif: timestamp("date_reception_justif"),
  dateDebit: timestamp("date_debit"),
  annulationCommercant: boolean("annulation_commercant").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Issued Representments table
export const issuedRepresentments = pgTable("issued_representments", {
  id: serial("id").primaryKey(),
  refFichier: text("ref_fichier").notNull(),
  dateTraitementRpa: timestamp("date_traitement_rpa").notNull(),
  numAffiliation: text("num_affiliation").notNull(),
  libCommercant: text("lib_commercant").notNull(),
  agence: text("agence").notNull(),
  compte: text("compte").notNull(),
  refFacture: text("ref_facture"),
  cardholder: text("cardholder"),
  operationCode: text("operation_code"),
  codeOperation: text("code_operation"),
  libCodeOperation: text("lib_code_operation"),
  amountCp: decimal("amount_cp", { precision: 12, scale: 2 }).notNull(),
  amountOrigine: decimal("amount_origine", { precision: 12, scale: 2 }).notNull(),
  card: text("card"),
  processing: text("processing"),
  transactionDate: timestamp("transaction_date").notNull(),
  authorization: text("authorization").notNull(),
  issuer: text("issuer"),
  local: text("local"),
  acquirer: text("acquirer"),
  libBank: text("lib_bank"),
  acquirerRef: text("acquirer_ref").notNull(),
  codeRepresentation: text("code_representation"),
  libRepresentation: text("lib_representation"),
  settlement: text("settlement"),
  annulationCommercant: boolean("annulation_commercant").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Issued Chargebacks table
export const issuedChargebacks = pgTable("issued_chargebacks", {
  id: serial("id").primaryKey(),
  refFichier: text("ref_fichier").notNull(),
  dateTraitementRpa: timestamp("date_traitement_rpa").notNull(),
  numAffiliation: text("num_affiliation").notNull(),
  libCommercant: text("lib_commercant").notNull(),
  agence: text("agence").notNull(),
  compte: text("compte").notNull(),
  refFacture: text("ref_facture"),
  typeCarte: text("type_carte"),
  cardholder: text("cardholder"),
  operationCode: text("operation_code"),
  codeOperation: text("code_operation"),
  libCodeOperation: text("lib_code_operation"),
  amountCp: decimal("amount_cp", { precision: 12, scale: 2 }).notNull(),
  amountOrigine: decimal("amount_origine", { precision: 12, scale: 2 }).notNull(),
  card: text("card"),
  processing: text("processing"),
  transactionDate: timestamp("transaction_date").notNull(),
  authorization: text("authorization").notNull(),
  issuer: text("issuer"),
  local: text("local"),
  acquirer: text("acquirer"),
  acquirerRef: text("acquirer_ref").notNull(),
  codeRejet: text("code_rejet"),
  libRejet: text("lib_rejet"),
  settlement: text("settlement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Received Representments table
export const receivedRepresentments = pgTable("received_representments", {
  id: serial("id").primaryKey(),
  refFichier: text("ref_fichier").notNull(),
  dateTraitementRpa: timestamp("date_traitement_rpa").notNull(),
  numAffiliation: text("num_affiliation").notNull(),
  libCommercant: text("lib_commercant").notNull(),
  agence: text("agence").notNull(),
  compte: text("compte").notNull(),
  refFacture: text("ref_facture"),
  typeCarte: text("type_carte"),
  cardholder: text("cardholder"),
  operationCode: text("operation_code"),
  codeOperation: text("code_operation"),
  libCodeOperation: text("lib_code_operation"),
  amountCp: decimal("amount_cp", { precision: 12, scale: 2 }).notNull(),
  amountOrigine: decimal("amount_origine", { precision: 12, scale: 2 }).notNull(),
  card: text("card"),
  processing: text("processing"),
  transactionDate: timestamp("transaction_date").notNull(),
  authorization: text("authorization").notNull(),
  issuer: text("issuer"),
  local: text("local"),
  acquirer: text("acquirer"),
  acquirerRef: text("acquirer_ref").notNull(),
  codeRepresentation: text("code_representation"),
  libRepresentation: text("lib_representation"),
  settlement: text("settlement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit Log table
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  tableName: text("table_name"),
  recordId: text("record_id"),
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLog),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertReceivedChargebackSchema = createInsertSchema(receivedChargebacks).omit({
  id: true,
  createdAt: true,
});

export const insertIssuedRepresentmentSchema = createInsertSchema(issuedRepresentments).omit({
  id: true,
  createdAt: true,
});

export const insertIssuedChargebackSchema = createInsertSchema(issuedChargebacks).omit({
  id: true,
  createdAt: true,
});

export const insertReceivedRepresentmentSchema = createInsertSchema(receivedRepresentments).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ReceivedChargeback = typeof receivedChargebacks.$inferSelect;
export type InsertReceivedChargeback = z.infer<typeof insertReceivedChargebackSchema>;
export type IssuedRepresentment = typeof issuedRepresentments.$inferSelect;
export type InsertIssuedRepresentment = z.infer<typeof insertIssuedRepresentmentSchema>;
export type IssuedChargeback = typeof issuedChargebacks.$inferSelect;
export type InsertIssuedChargeback = z.infer<typeof insertIssuedChargebackSchema>;
export type ReceivedRepresentment = typeof receivedRepresentments.$inferSelect;
export type InsertReceivedRepresentment = z.infer<typeof insertReceivedRepresentmentSchema>;
export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
