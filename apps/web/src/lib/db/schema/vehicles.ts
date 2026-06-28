import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const vehicles = sqliteTable("vehicles", {
  samsaraID: text("samsara_id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: int("year").notNull(),
  licensePlate: text("license_plate"),
  adaAccessible: int("ada_accessible", { mode: "boolean" }).notNull(),
});
