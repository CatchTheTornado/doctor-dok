import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const stats = sqliteTable('stats', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    eventName: text('eventName'),
    promptTokens: integer('promptTokens', { mode: 'number' }),
    completionTokens: integer('completionTokens', { mode: 'number' }),
    finishReasons: text('finishReasons'),
    createdAt: text('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP`),
    createdMonth: integer('createdMonth'), // for easier grouping
    createdDay: integer('createdDay'),
    createdYear: integer('createdYear'),
    createdHour: integer('createdHour')
});

