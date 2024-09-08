ALTER TABLE `audit` RENAME COLUMN `keyHashId` TO `keyLocatorHash`;--> statement-breakpoint
ALTER TABLE `audit` RENAME COLUMN `databaseHashId` TO `databaseIdHash`;