import { BaseRepository } from "./base-repository"
import { PatientDTO } from "../dto";
import { pool } from '@/data/server/db-provider'
import { patients } from "./db-schema";
import { eq } from "drizzle-orm";
import { create } from "./generic-repository";

export default class ServerPatientRepository extends BaseRepository<PatientDTO> {

    // create a new patinet
    async create(item: PatientDTO): Promise<PatientDTO> {
        const db = (await this.db());
        return create(item, patients, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: PatientDTO): Promise<PatientDTO> {        
        const db = (await this.db());
        let existingPatient = db.select().from(patients).where(eq(patients.id, query.id)).get() as PatientDTO
        if (!existingPatient) {
            existingPatient = await this.create(item)
        } else {
            existingPatient.firstName = item.firstName
            existingPatient.lastName = item.lastName
            existingPatient.dateOfBirth = item.dateOfBirth
            existingPatient.email = item.email
            db.update(patients).set(existingPatient).where(eq(patients.id, query.id)).run();
        }
        return Promise.resolve(existingPatient as PatientDTO)   
    }    

    async delete(query: Record<string, string>): Promise<boolean> {
        const db = (await this.db());
        return db.delete(patients).where(eq(patients.id, parseInt(query.id))).run()
    }

    async findAll(): Promise<PatientDTO[]> {
        const db = (await this.db());
        return Promise.resolve(db.select({
            id: patients.id,
            firstName: patients.firstName,
            lastName: patients.lastName,
            dateOfBirth: patients.dateOfBirth,
            email: patients.email,
            updatedAt: patients.updatedAt
        }).from(patients).all() as PatientDTO[])
    }

}