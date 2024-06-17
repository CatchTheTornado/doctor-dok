import { BaseRepository, create } from "../base-repository"
import { Patient } from "../models";
import { db } from '@/db/server/db-provider'
import { patients } from "./schema";
import { eq } from "drizzle-orm";

export default class ServerPatientRepository extends BaseRepository<Patient> {

    // create a new patinet
    async create(item: Patient): Promise<Patient> {
        return create(item, patients, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: Patient): Promise<Patient> {        

        let existingPatient = db.select().from(patients).where(eq(patients.id, query.id)).get() as Patient
        if (!existingPatient) {
            existingPatient = await this.create(existingPatient)
        } else {
            existingPatient.firstName = item.firstName
            existingPatient.lastName = item.lastName
            db.update(patients).set(existingPatient).where(eq(patients.id, query.id)).run();
        }
        return Promise.resolve(existingPatient as Patient)   
    }    

    async findAll(): Promise<Patient[]> {
        return Promise.resolve(db.select({
            id: patients.id,
            firstName: patients.firstName,
            lastName: patients.lastName,
            updatedAt: patients.updatedAt
        }).from(patients).all() as Patient[])
    }

}