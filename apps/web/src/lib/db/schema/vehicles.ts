import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const vehicles = sqliteTable("vehicles", {
  samsaraID: text("samsara_id").primaryKey(),
  name: text("name").notNull(),
  make: text("make"),
  model: text("model"),
  year: int("year"),
  licensePlate: text("license_plate"),
  adaAccessible: int("ada_accessible", { mode: "boolean" }).notNull(),
  type: text("type", { enum: ["vehicle", "equipment"] }).notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
