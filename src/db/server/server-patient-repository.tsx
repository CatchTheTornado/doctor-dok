import { BaseRepository } from "../base-repository"
import { Patient } from "../models";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import path from 'path'

export default class ServerPatientRepository extends BaseRepository<Patient> {
    readonly dbFilePath = process.env.DB_FILE ?? path.resolve(process.cwd()) + '/data/db.sqlite'
    readonly sqlite = new Database(this.dbFilePath);
    readonly db = drizzle(this.sqlite);        
    readonly patients = sqliteTable('patients', {
        id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
        first_name: text('first_name'),
        last_name: text('last_name'),        
        updated_at: text('text_modifiers').notNull().default(sql`CURRENT_TIMESTAMP`)
    });

    // create a new patinet
    create(item: Patient): Promise<Patient> {
        const returnedPatient = this.db.insert(this.patients).values({
            first_name: item.firstName,
            last_name: item.lastName
        }).returning({ id: this.patients.id, firstName: this.patients.first_name, lastName: this.patients.last_name }).get()

        console.log(returnedPatient)
        return Promise.resolve(returnedPatient as Patient)   
    }

}