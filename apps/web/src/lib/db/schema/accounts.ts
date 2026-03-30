import { randomUUID } from "crypto";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const accounts = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userID: text("user_id")
    .references(() => users.id)
    .notNull(),
  signInMethod: text("sign_in_method", {
    enum: ["google", "ut", "generic"],
  }).notNull(),
});

export type Account = typeof accounts.$inferSelect;
