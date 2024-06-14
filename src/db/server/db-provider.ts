import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from 'path'

const rootPath = path.resolve(process.cwd())
export const dbFilePath = process.env.DB_FILE ?? rootPath + '/data/db.sqlite'
export const sqlite = new Database(dbFilePath);
export const db = drizzle(sqlite);        

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