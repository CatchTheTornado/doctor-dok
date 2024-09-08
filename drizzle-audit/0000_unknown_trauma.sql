CREATE TABLE `audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text,
	`ua` text,
	`keyHashId` text,
	`databaseHashId` text,
	`recordLocator` text,
	`diff` text,
	`eventName` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
