import { type Analysis, type Discussion, type InsertAnalysis, type InsertDiscussion, type User, type InsertUser, type Transaction, type InsertTransaction, type PendingCredit, type InsertPendingCredit, analyses, discussions, users, transactions, pendingCredits } from "../shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserCredits(userId: number, credits: number): Promise<void>;
  updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string): Promise<void>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  
  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  updateAnalysisStatus(id: string, status: string): Promise<void>;
  updateAnalysisResults(id: string, results: any): Promise<void>;
  markSaved(id: string): Promise<void>;
  
  // Discussion operations
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  getDiscussionsByAnalysisId(analysisId: string): Promise<Discussion[]>;
  
  // Recent analyses
  getRecentAnalyses(limit?: number): Promise<Analysis[]>;
  
  // Saved analyses
  getSavedAnalyses(userId?: number): Promise<Analysis[]>;
  
  // User-specific analyses
  getAnalysesByUser(userId: number): Promise<Analysis[]>;
  
  // Credit consumption
  consumeUserCredits(userId: number, creditsUsed: number): Promise<void>;
  checkUserCredits(userId: number, requiredCredits: number): Promise<boolean>;
  
  // Pending credit operations
  createPendingCredit(pendingCredit: InsertPendingCredit): Promise<PendingCredit>;
  getPendingCreditByToken(claimToken: string): Promise<PendingCredit | undefined>;
  claimPendingCredit(claimToken: string, userId: number): Promise<PendingCredit | undefined>;
  getPendingCreditsByPaymentIntent(paymentIntentId: string): Promise<PendingCredit[]>;
}

// Referenced from javascript_database integration
export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Handle case-insensitive lookup for special admin user
    if (username.toLowerCase() === 'jmkuczynski') {
      const [user] = await db
        .select()
        .from(users)
        .where(sql`LOWER(username) = 'jmkuczynski'`);
      return user || undefined;
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async getAnalysesByUser(userId: number): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt));
  }

  // User management methods
  async updateUserCredits(userId: number, credits: number): Promise<void> {
    await db
      .update(users)
      .set({ credits })
      .where(eq(users.id, userId));
  }

  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<void> {
    await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id));
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, id));
    return analysis || undefined;
  }

  async updateAnalysisStatus(id: string, status: string): Promise<void> {
    await db
      .update(analyses)
      .set({ status, updatedAt: new Date() })
      .where(eq(analyses.id, id));
  }

  async updateAnalysisResults(id: string, results: any): Promise<void> {
    await db
      .update(analyses)
      .set({ results, updatedAt: new Date() })
      .where(eq(analyses.id, id));
  }

  async markSaved(id: string): Promise<void> {
    await db
      .update(analyses)
      .set({ saved: true, updatedAt: new Date() })
      .where(eq(analyses.id, id));
  }

  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const [discussion] = await db
      .insert(discussions)
      .values(insertDiscussion)
      .returning();
    return discussion;
  }

  async getDiscussionsByAnalysisId(analysisId: string): Promise<Discussion[]> {
    return await db
      .select()
      .from(discussions)
      .where(eq(discussions.analysisId, analysisId))
      .orderBy(discussions.createdAt);
  }

  async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.status, "completed"))
      .orderBy(desc(analyses.createdAt))
      .limit(limit);
  }

  async getSavedAnalyses(userId?: number): Promise<Analysis[]> {
    if (userId !== undefined) {
      // Return user-specific saved analyses
      return await db
        .select()
        .from(analyses)
        .where(eq(analyses.saved, true) && eq(analyses.userId, userId))
        .orderBy(desc(analyses.createdAt));
    } else {
      // Return global saved analyses (backwards compatibility)
      return await db
        .select()
        .from(analyses)
        .where(eq(analyses.saved, true))
        .orderBy(desc(analyses.createdAt));
    }
  }
  
  // Credit management methods
  async consumeUserCredits(userId: number, creditsUsed: number): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Special handling for admin user - never consume credits
    if (user.username.toLowerCase() === 'jmkuczynski') {
      return; // Don't consume credits for admin user
    }
    
    const newCredits = Math.max(0, (user.credits || 0) - creditsUsed);
    await this.updateUserCredits(userId, newCredits);
  }
  
  async checkUserCredits(userId: number, requiredCredits: number): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      return false;
    }
    
    // Special handling for admin user - always has unlimited credits
    if (user.username.toLowerCase() === 'jmkuczynski') {
      return true;
    }
    
    return (user.credits || 0) >= requiredCredits;
  }
  
  // Pending credit operations
  async createPendingCredit(insertPendingCredit: InsertPendingCredit): Promise<PendingCredit> {
    const [pendingCredit] = await db
      .insert(pendingCredits)
      .values(insertPendingCredit)
      .returning();
    return pendingCredit;
  }

  async getPendingCreditByToken(claimToken: string): Promise<PendingCredit | undefined> {
    const [pendingCredit] = await db
      .select()
      .from(pendingCredits)
      .where(eq(pendingCredits.claimToken, claimToken));
    return pendingCredit || undefined;
  }

  async claimPendingCredit(claimToken: string, userId: number): Promise<PendingCredit | undefined> {
    // Get the pending credit
    const pendingCredit = await this.getPendingCreditByToken(claimToken);
    if (!pendingCredit || pendingCredit.claimed) {
      return undefined;
    }

    // Mark as claimed and associate with user
    const [updatedCredit] = await db
      .update(pendingCredits)
      .set({
        claimed: true,
        claimedByUserId: userId,
      })
      .where(eq(pendingCredits.claimToken, claimToken))
      .returning();

    // Add credits to user account
    if (updatedCredit) {
      const user = await this.getUserById(userId);
      if (user) {
        const newCredits = (user.credits || 0) + updatedCredit.credits;
        await this.updateUserCredits(userId, newCredits);
      }
    }

    return updatedCredit || undefined;
  }

  async getPendingCreditsByPaymentIntent(paymentIntentId: string): Promise<PendingCredit[]> {
    return await db
      .select()
      .from(pendingCredits)
      .where(eq(pendingCredits.stripePaymentIntentId, paymentIntentId));
  }
}

export const storage = new DatabaseStorage();
