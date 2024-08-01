CREATE TABLE `keys` (
	`keyLocatorHash` text PRIMARY KEY NOT NULL,
	`databaseIdHash` text NOT NULL,
	`keyHash` text NOT NULL,
	`keyHashParams` text NOT NULL,
	`encryptedMasterKey` text NOT NULL,
	`acl` text,
	`extra` text,
	`expiryDate` text DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
