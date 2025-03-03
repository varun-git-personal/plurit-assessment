CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`coupon_code` text NOT NULL,
	`description` text NOT NULL,
	`discount_type` text NOT NULL,
	`discount_value` real NOT NULL,
	`max_discount` real,
	`min_purchase` real DEFAULT 0,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`usage_limit` integer,
	`used_count` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_coupon_code_unique` ON `coupons` (`coupon_code`);--> statement-breakpoint
CREATE INDEX `coupons_code_idx` ON `coupons` (`coupon_code`);--> statement-breakpoint
CREATE INDEX `coupons_active_idx` ON `coupons` (`is_active`);--> statement-breakpoint
CREATE INDEX `coupons_date_idx` ON `coupons` (`end_date`);--> statement-breakpoint
ALTER TABLE `offers` ADD `created_at` integer DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `offers` ADD `updated_at` integer DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `offers` ADD `coupon_id` integer REFERENCES coupons(id);--> statement-breakpoint
ALTER TABLE `tariffs` ADD `created_at` integer DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `tariffs` ADD `updated_at` integer DEFAULT CURRENT_TIMESTAMP;