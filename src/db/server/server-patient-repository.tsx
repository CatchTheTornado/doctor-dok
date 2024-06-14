import { BaseRepository } from "../base-repository"
import { Patient } from "../models";
import { db } from '@/db/server/db-provider'
import { patients } from "./schema";

export default class ServerPatientRepository extends BaseRepository<Patient> {

    // create a new patinet
    create(item: Patient): Promise<Patient> {
        const returnedPatient = db.insert(patients).values({
            firstName: item.firstName,
            lastName: item.lastName
        }).returning({ id: patients.id, firstName: patients.firstName, lastName: patients.lastName }).get()
        return Promise.resolve(returnedPatient as Patient)   
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