CREATE TABLE `booking_cancellations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text NOT NULL,
	`refund_amount` real,
	`refund_status` text,
	`refund_transaction_id` text,
	`cancelled_at` integer DEFAULT CURRENT_TIMESTAMP,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `booking_cancellations_booking_id_idx` ON `booking_cancellations` (`booking_id`);--> statement-breakpoint
CREATE INDEX `booking_cancellations_status_idx` ON `booking_cancellations` (`status`);--> statement-breakpoint
CREATE TABLE `booking_seats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` text NOT NULL,
	`tariff_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_per_seat` real NOT NULL,
	`total_price` real NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `booking_seats_booking_id_idx` ON `booking_seats` (`booking_id`);--> statement-breakpoint
CREATE TABLE `booking_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_id` text NOT NULL,
	`booking_id` text NOT NULL,
	`amount` real NOT NULL,
	`status` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_details` text,
	`error_message` text,
	`transaction_date` integer DEFAULT CURRENT_TIMESTAMP,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_transactions_transaction_id_unique` ON `booking_transactions` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `booking_transactions_booking_id_idx` ON `booking_transactions` (`booking_id`);--> statement-breakpoint
CREATE INDEX `booking_transactions_date_idx` ON `booking_transactions` (`transaction_date`);--> statement-breakpoint
CREATE INDEX `booking_transactions_status_idx` ON `booking_transactions` (`status`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` text NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`status` text NOT NULL,
	`total_amount` real NOT NULL,
	`discount_amount` real DEFAULT 0,
	`tax_amount` real NOT NULL,
	`final_amount` real NOT NULL,
	`payment_status` text NOT NULL,
	`payment_method` text,
	`transaction_id` text,
	`coupon_code` text,
	`coupon_discount` real DEFAULT 0,
	`booking_date` integer DEFAULT CURRENT_TIMESTAMP,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `user_auth`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_booking_id_unique` ON `bookings` (`booking_id`);--> statement-breakpoint
CREATE INDEX `bookings_user_id_idx` ON `bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `bookings_event_id_idx` ON `bookings` (`event_id`);--> statement-breakpoint
CREATE INDEX `bookings_date_idx` ON `bookings` (`booking_date`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);