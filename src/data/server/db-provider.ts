import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from 'path'
import { getCurrentTS } from '@/lib/utils';
import fs from 'fs';

const rootPath = path.resolve(process.cwd())
export const dbFilePath = process.env.DB_FILE ?? rootPath + '/data/db.sqlite'
export let sqlite = new Database(dbFilePath);
export let db = drizzle(sqlite);        

let MIGRATIONS_EXECUTED = false

export async function setup(): Promise<{ dbFilePath: string, sqlite: Database, db: BetterSQLite3Database }> {
    if(!MIGRATIONS_EXECUTED) {
        console.log('Running migrations')
        await migrate(db, { migrationsFolder: './drizzle' }); // run the migrations
        MIGRATIONS_EXECUTED = true
    }
    return {
        dbFilePath, sqlite, db
    }
}

export async function formatDb(): Promise<{ dbFilePath: string, sqlite: Database, db: BetterSQLite3Database }> {
    fs.copyFileSync(rootPath + '/data/db.sqlite', rootPath + '/data/db.sqlite-' + getCurrentTS() + '.bak')
    fs.unlinkSync(rootPath + '/data/db.sqlite');

    sqlite = new Database(dbFilePath);
    db = drizzle(sqlite);        
    
    MIGRATIONS_EXECUTED = false;

    return setup();
}