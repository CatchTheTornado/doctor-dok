import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const patients = sqliteTable('patients', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    firstName: text('firstName'),
    lastName: text('lastName'),     
    email: text('email'),
    dateOfBirth: text('dateOfBirth'),   
    updatedAt: text('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP`)
});


export const config = sqliteTable('config', {
    key: text('key', { mode: 'text' }).primaryKey(),
    value: text('value'),
    updatedAt: text('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const patientRecords = sqliteTable('patientRecords', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    patientId: integer('patientId', { mode: 'number' }).references(() => patients.id),
    description: text('description'),
    type: text('type'),
    json: text('json', { mode: 'json' }),
    extra: text('extra', { mode: 'json' }),
    attachments: text('attachments', { mode: 'json' }),
    
    createdAt: text('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP`)
});


export const encryptedAttachments = sqliteTable('encryptedAttachments', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    
    displayName: text('displayName'),
    type: text('type'),
    url: text('url'),
    mimeType: text('mimeType'),

    assigned_to: text('json', { mode: 'json' }),

    json: text('json', { mode: 'json' }),
    extra: text('extra', { mode: 'json' }),
    size: integer('size', { mode: 'number' }),    


    storageKey: text('storageKey'),
    description: text('description'),
    
    createdAt: text('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updatedAt').notNull().default(sql`CURRENT_TIMESTAMP`)
});