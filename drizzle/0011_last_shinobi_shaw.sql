CREATE TABLE `keys` (
	`keyLocatorHash` text PRIMARY KEY NOT NULL,	
	`keyHash` text NOT NULL,
	`keyHashParams` text NOT NULL,
	`databaseIdHash` text,
	`encryptedMasterKey` text,
	`acl` text,
	`extra` text,
	`expiryDate` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
