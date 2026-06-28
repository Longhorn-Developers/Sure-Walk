import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const locations = sqliteTable("locations", {
  id: int("id").primaryKey(),
  abbreviation: text("abbreviation"),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: text("lat").notNull(),
  lon: text("lon").notNull(),
  type: text("type", { enum: ["pickup", "dropoff"] }).notNull(),
});
