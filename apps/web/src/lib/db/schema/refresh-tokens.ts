import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";
import { sql } from "drizzle-orm";

export const refreshTokens = sqliteTable("refresh_tokens", {
  jti: text("jti").primaryKey(),
  accountID: text("account_id")
    .references(() => accounts.id)
    .notNull(),
  hash: text("hash").notNull().unique(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  expiresAt: text("expires_at")
    .default(sql`(DATETIME('now', '+30 days'))`)
    .notNull(),
});
