PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cast` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_cast`("id", "name", "role") SELECT "id", "name", "role" FROM `cast`;--> statement-breakpoint
DROP TABLE `cast`;--> statement-breakpoint
ALTER TABLE `__new_cast` RENAME TO `cast`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`image` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "type", "image") SELECT "id", "name", "type", "image" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`date` integer NOT NULL,
	`category_id` integer,
	`genre_id` integer,
	`duration` integer NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`language_id` integer,
	`image` text NOT NULL,
	`time` text NOT NULL,
	`is_featured` integer DEFAULT 0,
	`is_trending` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "title", "description", "date", "category_id", "genre_id", "duration", "location", "city", "language_id", "image", "time", "is_featured", "is_trending", "created_at", "updated_at") SELECT "id", "title", "description", "date", "category_id", "genre_id", "duration", "location", "city", "language_id", "image", "time", "is_featured", "is_trending", "created_at", "updated_at" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE TABLE `__new_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_genres`("id", "name") SELECT "id", "name" FROM `genres`;--> statement-breakpoint
DROP TABLE `genres`;--> statement-breakpoint
ALTER TABLE `__new_genres` RENAME TO `genres`;--> statement-breakpoint
CREATE TABLE `__new_inclusions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
INSERT INTO `__new_inclusions`("id", "name", "description") SELECT "id", "name", "description" FROM `inclusions`;--> statement-breakpoint
DROP TABLE `inclusions`;--> statement-breakpoint
ALTER TABLE `__new_inclusions` RENAME TO `inclusions`;--> statement-breakpoint
CREATE TABLE `__new_languages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_languages`("id", "name") SELECT "id", "name" FROM `languages`;--> statement-breakpoint
DROP TABLE `languages`;--> statement-breakpoint
ALTER TABLE `__new_languages` RENAME TO `languages`;--> statement-breakpoint
CREATE TABLE `__new_offers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`discount_percentage` real,
	`valid_until` integer
);
--> statement-breakpoint
INSERT INTO `__new_offers`("id", "name", "description", "discount_percentage", "valid_until") SELECT "id", "name", "description", "discount_percentage", "valid_until" FROM `offers`;--> statement-breakpoint
DROP TABLE `offers`;--> statement-breakpoint
ALTER TABLE `__new_offers` RENAME TO `offers`;--> statement-breakpoint
CREATE TABLE `__new_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_rules`("id", "description") SELECT "id", "description" FROM `rules`;--> statement-breakpoint
DROP TABLE `rules`;--> statement-breakpoint
ALTER TABLE `__new_rules` RENAME TO `rules`;--> statement-breakpoint
CREATE TABLE `__new_tariffs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer,
	`type` text NOT NULL,
	`price` real NOT NULL,
	`seats` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tariffs`("id", "event_id", "type", "price", "seats") SELECT "id", "event_id", "type", "price", "seats" FROM `tariffs`;--> statement-breakpoint
DROP TABLE `tariffs`;--> statement-breakpoint
ALTER TABLE `__new_tariffs` RENAME TO `tariffs`;