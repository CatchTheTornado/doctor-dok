CREATE TABLE `keys` (
	`keyHash` text PRIMARY KEY NOT NULL,
	`databaseIdHash` text,
	`encryptedMasterKey` text,
	`acl` text,
	`extra` text,
	`expiryDate` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
