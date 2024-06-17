CREATE TABLE `patientrRecordAttachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patientId` integer,
	`patientRecordId` integer,
	`displayName` text,
	`type` text,
	`url` text,
	`json` text,
	`extra` text,
	`description` text,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientRecordId`) REFERENCES `patientRecords`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patientRecords` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patientId` integer,
	`description` text,
	`type` text,
	`json` text,
	`extra` text,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
