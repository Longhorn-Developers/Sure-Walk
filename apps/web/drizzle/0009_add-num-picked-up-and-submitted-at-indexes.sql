PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ride_id` text NOT NULL,
	`how_likely` integer NOT NULL,
	`extra_feedback` text,
	`submitted_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ride_id`) REFERENCES `rides`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_feedback`("id", "user_id", "ride_id", "how_likely", "extra_feedback", "submitted_at") SELECT "id", "user_id", "ride_id", "how_likely", "extra_feedback", "submitted_at" FROM `feedback`;--> statement-breakpoint
DROP TABLE `feedback`;--> statement-breakpoint
ALTER TABLE `__new_feedback` RENAME TO `feedback`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `submitted_at_feedback_idx` ON `feedback` (`submitted_at`);--> statement-breakpoint
CREATE TABLE `__new_rides` (
	`id` text PRIMARY KEY NOT NULL,
	`samsara_id` text NOT NULL,
	`user_id` text NOT NULL,
	`members` text NOT NULL,
	`pickup_location_id` integer NOT NULL,
	`dropoff_location_id` integer NOT NULL,
	`pickup_stop_id` text NOT NULL,
	`dropoff_stop_id` text NOT NULL,
	`est_pickup_time` text NOT NULL,
	`est_dropoff_time` text NOT NULL,
	`actual_pickup_time` text,
	`actual_dropoff_time` text,
	`pickup_stop_state` text DEFAULT 'unassigned' NOT NULL,
	`dropoff_stop_state` text DEFAULT 'unassigned' NOT NULL,
	`submitted_at` integer DEFAULT (unixepoch()) NOT NULL,
	`vehicle_id` text,
	`num_picked_up` integer,
	`share_code` text,
	`cancelled_time` text,
	`cancellation_reason` text,
	`cancellation_extra` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pickup_location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dropoff_location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`samsara_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_rides`("id", "samsara_id", "user_id", "members", "pickup_location_id", "dropoff_location_id", "pickup_stop_id", "dropoff_stop_id", "est_pickup_time", "est_dropoff_time", "actual_pickup_time", "actual_dropoff_time", "pickup_stop_state", "dropoff_stop_state", "submitted_at", "vehicle_id", "num_picked_up", "share_code", "cancelled_time", "cancellation_reason", "cancellation_extra") SELECT "id", "samsara_id", "user_id", "members", "pickup_location_id", "dropoff_location_id", "pickup_stop_id", "dropoff_stop_id", "est_pickup_time", "est_dropoff_time", "actual_pickup_time", "actual_dropoff_time", "pickup_stop_state", "dropoff_stop_state", "submitted_at", "vehicle_id", "num_picked_up", "share_code", "cancelled_time", "cancellation_reason", "cancellation_extra" FROM `rides`;--> statement-breakpoint
DROP TABLE `rides`;--> statement-breakpoint
ALTER TABLE `__new_rides` RENAME TO `rides`;--> statement-breakpoint
CREATE UNIQUE INDEX `rides_samsara_id_unique` ON `rides` (`samsara_id`);--> statement-breakpoint
CREATE INDEX `submitted_at_rides_idx` ON `rides` (`submitted_at`);