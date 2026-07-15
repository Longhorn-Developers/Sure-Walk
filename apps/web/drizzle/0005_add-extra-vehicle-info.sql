PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_vehicles` (
	`samsara_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`make` text,
	`model` text,
	`year` integer,
	`license_plate` text,
	`ada_accessible` integer NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_vehicles`("samsara_id", "name", "make", "model", "year", "license_plate", "ada_accessible", "type") SELECT "samsara_id", "name", "make", "model", "year", "license_plate", "ada_accessible", "type" FROM `vehicles`;--> statement-breakpoint
DROP TABLE `vehicles`;--> statement-breakpoint
ALTER TABLE `__new_vehicles` RENAME TO `vehicles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;