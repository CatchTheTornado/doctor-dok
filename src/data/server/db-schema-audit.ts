import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const audit = sqliteTable('audit', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    ip: text('ip'),
    ua: text('ua'),
    keyLocatorHash: text('keyLocatorHash'),
    databaseIdHash: text('databaseIdHash'),
    recordLocator: text('recordLocator'),
    encryptedDiff: text('diff'),
    eventName: text('eventName'),
    createdAt: text('createdAt').notNull().default(sql`CURRENT_TIMESTAMP`)
});

