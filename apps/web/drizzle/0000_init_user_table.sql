CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone_number` text,
	`requires_assistance` integer,
	`eid` text,
	`user_type` text,
	`creation_time` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_number_unique` ON `users` (`phone_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_eid_unique` ON `users` (`eid`);