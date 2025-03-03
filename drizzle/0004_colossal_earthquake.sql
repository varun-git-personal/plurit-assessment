PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`date` integer NOT NULL,
	`category_id` text,
	`genre_id` text,
	`duration` integer NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`language_id` text,
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
PRAGMA foreign_keys=ON;