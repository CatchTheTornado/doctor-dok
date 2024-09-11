CREATE TABLE `terms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text,
	`code` text,
	`key` text,
	`signature` text,
	`ip` text,
	`ua` text,
	`name` text,
	`email` text,
	`signedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);