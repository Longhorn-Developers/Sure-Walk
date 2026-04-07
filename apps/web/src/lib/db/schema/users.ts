import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").unique(),
  requiresAssistance: integer("requires_assistance", {
    mode: "boolean",
  }).notNull(),
  eid: text("eid"),
  userType: text("user_type", { enum: ["ut-affiliated", "guest"] }).notNull(),
  creationTime: text("creation_time")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type User = typeof users.$inferSelect;
