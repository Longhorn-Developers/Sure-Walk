import { randomUUID } from "crypto";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import GroupRideMember from "@sure-walk/utils/types/group-ride-member";
import { locations } from "./locations";
import { vehicles } from "./vehicles";
import { sql } from "drizzle-orm";

const stopStates: [string, ...string[]] = [
  "unassigned",
  "scheduled",
  "en route",
  "arrived",
  "skipped",
  "departed",
];

export const cancellationReasons: [string, ...string[]] = [
  "My ride never came",
  "The estimated wait was too long",
  "Weather improved",
  "Got a different ride",
  "I didn't receive a call",
  "Other",
];

export const rides = sqliteTable("rides", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  samsaraID: text("samsara_id").unique().notNull(),
  userID: text("user_id")
    .references(() => users.id)
    .notNull(),
  members: text("members", { mode: "json" })
    .$type<GroupRideMember[]>()
    .notNull(),
  pickupLocationID: int("pickup_location_id")
    .references(() => locations.id)
    .notNull(),
  dropoffLocationID: int("dropoff_location_id")
    .references(() => locations.id)
    .notNull(),
  pickupStopID: text("pickup_stop_id").notNull(),
  dropoffStopID: text("dropoff_stop_id").notNull(),
  estPickupTime: text("est_pickup_time").notNull(),
  estDropoffTime: text("est_dropoff_time").notNull(),
  actualPickupTime: text("actual_pickup_time"),
  actualDropoffTime: text("actual_dropoff_time"),
  pickupStopState: text("pickup_stop_state", { enum: stopStates })
    .notNull()
    .default("unassigned"),
  dropoffStopState: text("dropoff_stop_state", { enum: stopStates })
    .notNull()
    .default("unassigned"),
  submittedAt: text("submitted_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  vehicleID: text("vehicle_id").references(() => vehicles.samsaraID),
  missedPickup: int("missed_pickup", { mode: "boolean" })
    .notNull()
    .default(false),
  shareCode: text("share_code"),
  cancelledTime: text("cancelled_time"),
  cancellationReason: text("cancellation_reason", {
    enum: cancellationReasons,
  }),
  cancellationExtra: text("cancellation_extra"),
});

export const Ride = rides.$inferSelect;
