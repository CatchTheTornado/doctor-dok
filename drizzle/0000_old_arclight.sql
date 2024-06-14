CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text,
	`lastName` text,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
