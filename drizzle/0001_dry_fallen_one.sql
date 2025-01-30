ALTER TABLE `locations` DROP FOREIGN KEY `locations_country_id_countries_id_fk`;
--> statement-breakpoint
ALTER TABLE `locations` DROP FOREIGN KEY `locations_city_id_cities_id_fk`;
--> statement-breakpoint
ALTER TABLE `locations` DROP FOREIGN KEY `locations_state_id_states_id_fk`;
--> statement-breakpoint
ALTER TABLE `cities` ADD `country_id` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `districts` ADD `state_id` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `states` ADD `city_id` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `cities` ADD CONSTRAINT `cities_country_id_countries_id_fk` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `districts` ADD CONSTRAINT `districts_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `states` ADD CONSTRAINT `states_city_id_cities_id_fk` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `locations` DROP COLUMN `country_id`;--> statement-breakpoint
ALTER TABLE `locations` DROP COLUMN `city_id`;--> statement-breakpoint
ALTER TABLE `locations` DROP COLUMN `state_id`;