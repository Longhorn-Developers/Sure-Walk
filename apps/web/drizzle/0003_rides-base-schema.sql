CREATE TABLE `locations` (
	`id` integer PRIMARY KEY NOT NULL,
	`abbreviation` text,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rides` (
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
	`submitted_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`vehicle_id` text,
	`cancelled_time` text,
	`cancellation_reason` text,
	`cancellation_extra` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pickup_location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dropoff_location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`samsara_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rides_samsara_id_unique` ON `rides` (`samsara_id`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`samsara_id` text PRIMARY KEY NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`license_plate` text,
	`ada_accessible` integer NOT NULL
);
