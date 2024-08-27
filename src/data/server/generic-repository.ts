import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

// create a new folder record
export async function create<T extends { [key:string]: any }>(item: T, schema: any, db:BetterSQLite3Database<Record<string, never>>): Promise<T> {
    const returnedItem = db.insert(schema).values(item).returning().get();
    return Promise.resolve(returnedItem as T);
}
