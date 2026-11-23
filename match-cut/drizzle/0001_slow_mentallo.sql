CREATE TABLE `accounts` (
	`username` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`salt` text NOT NULL,
	`password_hash` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_profile_id_unique` ON `accounts` (`profile_id`);--> statement-breakpoint
CREATE TABLE `auth_attempts` (
	`scope` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_attempts_by_expiration` ON `auth_attempts` (`expires_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_by_expiration` ON `sessions` (`expires_at`);