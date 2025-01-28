CREATE TABLE `user_status` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_status_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_status_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `status` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verification_token` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_status_user_status_id_fk` FOREIGN KEY (`status`) REFERENCES `user_status`(`id`) ON DELETE no action ON UPDATE no action;