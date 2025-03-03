PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tariffs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text,
	`type` text NOT NULL,
	`price` real NOT NULL,
	`seats` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tariffs`("id", "event_id", "type", "price", "seats") SELECT "id", "event_id", "type", "price", "seats" FROM `tariffs`;--> statement-breakpoint
DROP TABLE `tariffs`;--> statement-breakpoint
ALTER TABLE `__new_tariffs` RENAME TO `tariffs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;