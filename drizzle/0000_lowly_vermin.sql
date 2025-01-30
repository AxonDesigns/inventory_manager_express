CREATE TABLE `cities` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `cities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `districts` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `districts_id` PRIMARY KEY(`id`),
	CONSTRAINT `districts_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`country_id` char(36) NOT NULL,
	`city_id` char(36) NOT NULL,
	`state_id` char(36) NOT NULL,
	`district_id` char(36) NOT NULL,
	`zip` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `states_id` PRIMARY KEY(`id`),
	CONSTRAINT `states_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_methods_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `transaction_categories` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transaction_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `transaction_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `transaction_payments` (
	`id` char(36) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`description` varchar(255) NOT NULL,
	`currency` varchar(255) NOT NULL,
	`method` char(36) NOT NULL,
	`transaction_id` char(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transaction_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` char(36) NOT NULL,
	`status` varchar(255) NOT NULL,
	`total_amount` decimal(15,2) NOT NULL,
	`paid_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
	`pending_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
	`tax` decimal(15,2) DEFAULT 0.00,
	`fee` decimal(15,2) DEFAULT 0.00,
	`location_id` char(36) NOT NULL,
	`description` text,
	`employee_id` char(36) NOT NULL,
	`category_id` char(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_contacts` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`location_id` char(36) NOT NULL,
	`cellphone` varchar(255) NOT NULL,
	`telephone` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_contacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contacts_cellphone_check_001` CHECK(cellphone REGEXP '^[0-9]+$'),
	CONSTRAINT `contacts_telephone_check_001` CHECK(telephone REGEXP '^[0-9]+$')
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_statuses` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_statuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_statuses_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role_id` char(36) NOT NULL,
	`status_id` char(36) NOT NULL,
	`password` varchar(255) NOT NULL,
	`verification_token` varchar(32),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_email_check_001` CHECK(email REGEXP '^(?=[a-zA-Z0-9@._%+-]{1,254}$)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$')
);
--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_country_id_countries_id_fk` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_city_id_cities_id_fk` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_district_id_districts_id_fk` FOREIGN KEY (`district_id`) REFERENCES `districts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_payments` ADD CONSTRAINT `transaction_payments_method_payment_methods_id_fk` FOREIGN KEY (`method`) REFERENCES `payment_methods`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_payments` ADD CONSTRAINT `transaction_payments_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_employee_id_users_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_transaction_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `transaction_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_user_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `user_roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_status_id_user_statuses_id_fk` FOREIGN KEY (`status_id`) REFERENCES `user_statuses`(`id`) ON DELETE no action ON UPDATE no action;