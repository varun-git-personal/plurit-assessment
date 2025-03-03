CREATE TABLE `recently_viewed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`viewed_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `user_auth`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_viewed_at_idx` ON `recently_viewed` (`user_id`,`viewed_at`);--> statement-breakpoint
CREATE TABLE `user_auth` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`is_verified` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_auth_user_id_unique` ON `user_auth` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_auth_username_unique` ON `user_auth` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_auth_email_unique` ON `user_auth` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user_auth` (`email`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `user_auth` (`username`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`avatar` text,
	`date_of_birth` integer,
	`gender` text,
	`city` text,
	`bio` text,
	`preferences` text,
	`last_active` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `user_auth`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_user_id_unique` ON `user_profile` (`user_id`);--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `user_auth`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_event_unique_idx` ON `wishlist` (`user_id`,`event_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `wishlist` (`user_id`);