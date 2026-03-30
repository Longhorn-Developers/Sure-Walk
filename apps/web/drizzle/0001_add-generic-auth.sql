CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`sign_in_method` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `codes` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`identifier` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`new_requires_assistance` integer,
	`new_user_type` text,
	`code` text(6) NOT NULL,
	`expires_at` text DEFAULT (DATETIME('now', '+10 minutes')) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `codes_code_unique` ON `codes` (`code`);--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`jti` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`hash` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`expires_at` text DEFAULT (DATETIME('now', '+30 days')) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_hash_unique` ON `refresh_tokens` (`hash`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone_number` text,
	`requires_assistance` integer NOT NULL,
	`eid` text,
	`user_type` text NOT NULL,
	`creation_time` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "first_name", "last_name", "phone_number", "requires_assistance", "eid", "user_type", "creation_time") SELECT "id", "first_name", "last_name", "phone_number", "requires_assistance", "eid", "user_type", "creation_time" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_number_unique` ON `users` (`phone_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_eid_unique` ON `users` (`eid`);