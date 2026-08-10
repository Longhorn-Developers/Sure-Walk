DROP INDEX IF EXISTS `submitted_at_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `rides_pickup_stop_id_unique` ON `rides` (`pickup_stop_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `rides_dropoff_stop_id_unique` ON `rides` (`dropoff_stop_id`);--> statement-breakpoint