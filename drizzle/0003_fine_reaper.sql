PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_event_cast` (
	`event_id` text,
	`cast_id` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cast_id`) REFERENCES `cast`(`cast_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_event_cast`("event_id", "cast_id") SELECT "event_id", "cast_id" FROM `event_cast`;--> statement-breakpoint
DROP TABLE `event_cast`;--> statement-breakpoint
ALTER TABLE `__new_event_cast` RENAME TO `event_cast`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_event_inclusions` (
	`event_id` text,
	`inclusion_id` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inclusion_id`) REFERENCES `inclusions`(`inclusion_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_event_inclusions`("event_id", "inclusion_id") SELECT "event_id", "inclusion_id" FROM `event_inclusions`;--> statement-breakpoint
DROP TABLE `event_inclusions`;--> statement-breakpoint
ALTER TABLE `__new_event_inclusions` RENAME TO `event_inclusions`;--> statement-breakpoint
CREATE TABLE `__new_event_offers` (
	`event_id` text,
	`offer_id` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`offer_id`) REFERENCES `offers`(`offer_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_event_offers`("event_id", "offer_id") SELECT "event_id", "offer_id" FROM `event_offers`;--> statement-breakpoint
DROP TABLE `event_offers`;--> statement-breakpoint
ALTER TABLE `__new_event_offers` RENAME TO `event_offers`;--> statement-breakpoint
CREATE TABLE `__new_event_rules` (
	`event_id` text,
	`rule_id` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_id`) REFERENCES `rules`(`rule_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_event_rules`("event_id", "rule_id") SELECT "event_id", "rule_id" FROM `event_rules`;--> statement-breakpoint
DROP TABLE `event_rules`;--> statement-breakpoint
ALTER TABLE `__new_event_rules` RENAME TO `event_rules`;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
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
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`genre_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`language_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "event_id", "title", "description", "date", "category_id", "genre_id", "duration", "location", "city", "language_id", "image", "time", "is_featured", "is_trending", "created_at", "updated_at") SELECT "id", "event_id", "title", "description", "date", "category_id", "genre_id", "duration", "location", "city", "language_id", "image", "time", "is_featured", "is_trending", "created_at", "updated_at" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE TABLE `__new_tariffs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer,
	`type` text NOT NULL,
	`price` real NOT NULL,
	`seats` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tariffs`("id", "event_id", "type", "price", "seats") SELECT "id", "event_id", "type", "price", "seats" FROM `tariffs`;--> statement-breakpoint
DROP TABLE `tariffs`;--> statement-breakpoint
ALTER TABLE `__new_tariffs` RENAME TO `tariffs`;