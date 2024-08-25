CREATE TABLE `stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventName` text,
	`promptTokens` integer,
	`completionTokens` integer,
	`finishReasons` text,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`createdMonth` integer,
	`createdDay` integer,
	`createdYear` integer,
	`createdHour` integer
);
