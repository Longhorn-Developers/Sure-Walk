import { sql } from "drizzle-orm";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

import { rides } from "./rides";
import { users } from "./users";

export const feedback = sqliteTable(
  "feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => v7()),
    userID: text("user_id")
      .references(() => users.id)
      .notNull(),
    rideID: text("ride_id")
      .references(() => rides.id)
      .notNull(),
    howLikely: int("how_likely").notNull(),
    extraFeedback: text("extra_feedback"),
    submittedAt: int("submitted_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => [index("submitted_at_feedback_idx").on(table.submittedAt)],
);
