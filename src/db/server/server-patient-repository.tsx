import { BaseRepository } from "../base-repository"
import { Patient } from "../models";
import { db } from '@/db/server/db-provider'
import { patients } from "./schema";
import { eq } from "drizzle-orm";

export default class ServerPatientRepository extends BaseRepository<Patient> {

    // create a new patinet
    create(item: Patient): Promise<Patient> {
        const returnedPatient = db.insert(patients).values({
            firstName: item.firstName,
            lastName: item.lastName
        }).returning({ id: patients.id, firstName: patients.firstName, lastName: patients.lastName }).get()
        return Promise.resolve(returnedPatient as Patient)   
    }

    // update patient
    update(query:Record<string, any>, item: Patient): Promise<Patient> {        

        if(!query.id) throw new Error('Please set the query.id to update the right patient');

        let existingPatient = db.select().from(patients).where(eq(patients.id, query.id)).get()
        if (!existingPatient) {
            existingPatient = db.insert(patients).values(item).returning().get()
        }
        existingPatient.firstName = item.firstName
        existingPatient.lastName = item.lastName
        db.update(patients).set(existingPatient).where(eq(patients.id, query.id)).run();
        return Promise.resolve(existingPatient as Patient)   
    }    

    findAll(): Promise<Patient[]> {
        return Promise.resolve(db.select({
            id: patients.id,
            firstName: patients.firstName,
            lastName: patients.lastName,
            updatedAt: patients.updatedAt
        }).from(patients).all() as Patient[])
    }

}