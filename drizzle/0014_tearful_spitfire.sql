ALTER TABLE `folders` DROP COLUMN `firstName`;--> statement-breakpoint
ALTER TABLE `folders` DROP COLUMN `lastName`;--> statement-breakpoint
ALTER TABLE `folders` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `folders` DROP COLUMN `dateOfBirth`;--> statement-breakpoint
ALTER TABLE `folders` ADD `name` text;