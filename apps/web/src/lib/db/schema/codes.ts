import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";
import { randomInt, randomUUID } from "crypto";
import { sql } from "drizzle-orm";

export const codes = sqliteTable("codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  accountID: text("account_id")
    .references(() => accounts.id)
    .notNull(),
  identifier: text("identifier").notNull(),
  newFirstName: text("first_name"),
  newLastName: text("last_name"),
  newRequiresAssistance: int("new_requires_assistance", { mode: "boolean" }),
  newUserType: text("new_user_type", { enum: ["ut-affiliated", "guest"] }),
  code: text("code", { length: 6 })
    .$defaultFn(() => randomInt(100000, 999999).toString())
    .unique()
    .notNull(),
  expiresAt: text("expires_at")
    .default(sql`(DATETIME('now', '+10 minutes'))`)
    .notNull(),
});
