import { BaseRepository } from "./base-repository"
import { PatientDTO } from "../models";
import { db } from '@/data/server/db-provider'
import { patients } from "./db-schema";
import { eq } from "drizzle-orm";
import { create } from "./generic-repository";

export default class ServerPatientRepository extends BaseRepository<PatientDTO> {

    // create a new patinet
    async create(item: PatientDTO): Promise<PatientDTO> {
        return create(item, patients, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: PatientDTO): Promise<PatientDTO> {        

        let existingPatient = db.select().from(patients).where(eq(patients.id, query.id)).get() as PatientDTO
        if (!existingPatient) {
            existingPatient = await this.create(existingPatient)
        } else {
            existingPatient.firstName = item.firstName
            existingPatient.lastName = item.lastName
            db.update(patients).set(existingPatient).where(eq(patients.id, query.id)).run();
        }
        return Promise.resolve(existingPatient as PatientDTO)   
    }    

    async findAll(): Promise<PatientDTO[]> {
        return Promise.resolve(db.select({
            id: patients.id,
            firstName: patients.firstName,
            lastName: patients.lastName,
            updatedAt: patients.updatedAt
        }).from(patients).all() as PatientDTO[])
    }

}