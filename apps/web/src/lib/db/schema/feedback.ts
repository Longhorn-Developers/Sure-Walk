import { randomUUID } from "crypto";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { rides } from "./rides";
import { sql } from "drizzle-orm";

export const feedback = sqliteTable("feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userID: text("user_id")
    .references(() => users.id)
    .notNull(),
  rideID: text("ride_id")
    .references(() => rides.id)
    .notNull(),
  howLikely: int("how_likely").notNull(),
  extraFeedback: text("extra_feedback"),
  submittedAt: text("submitted_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});
