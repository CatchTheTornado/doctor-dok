import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from 'path'
import { getCurrentTS } from '@/lib/utils';
import fs from 'fs';

const rootPath = path.resolve(process.cwd())

export const Pool = async (maxPool = 10) => {
	const databaseInstances: Record<string, BetterSQLite3Database> = {}

	return async (databaseId: string, createNewDb: boolean = false) => {
		if (databaseInstances[databaseId]) {
			return databaseInstances[databaseId]
		}

		if (Object.keys(databaseInstances).length >= maxPool) {
			delete databaseInstances[Object.keys(databaseInstances)[0]]
		}

		const databaseFile =  path.join(rootPath, 'data', databaseId,  'db.sqlite')
		let requiresMigration = true

		try {
			fs.accessSync(databaseFile)
			requiresMigration = false
		} catch (error) {
            if (createNewDb) {
		    	requiresMigration = true
            } else {
                throw new Error('Database not found or inaccessible')
            }
		}

		const db = new Database(databaseFile)
		databaseInstances[databaseId] = drizzle(db)

		if (requiresMigration) {
            console.log('Running migrations')
			await migrate(databaseInstances[databaseId], { migrationsFolder: 'drizzle' })
		}

		return databaseInstances[databaseId]
	}
}

export const pool = Pool()


