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

export function getCurrentTS(): string {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    return formattedDate;   
}