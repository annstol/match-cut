CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`color` text DEFAULT 'red' NOT NULL,
	`demo` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`profile_id` text NOT NULL,
	`film_id` text NOT NULL,
	`score` integer,
	PRIMARY KEY(`profile_id`, `film_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ratings_by_film` ON `ratings` (`film_id`);