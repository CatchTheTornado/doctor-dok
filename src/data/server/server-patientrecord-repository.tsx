import { BaseRepository } from "./base-repository"
import { PatientRecordDTO } from "../dto";
import { db } from '@/data/server/db-provider'
import { getCurrentTS } from "@/lib/utils";
import { patientRecords } from "./db-schema";
import { eq } from "drizzle-orm";
import { error } from "console";
import { create } from "./generic-repository";

export default class ServerPatientRecordRepository extends BaseRepository<PatientRecordDTO> {
    
    
    async create(item: PatientRecordDTO): Promise<PatientRecordDTO> {
        return create(item, patientRecords, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: PatientRecordDTO): Promise<PatientRecordDTO> {        
        let existingRecord:PatientRecordDTO | null = query.id ? db.select().from(patientRecords).where(eq(patientRecords.id, query.id)).get() as PatientRecordDTO : null
        if (!existingRecord) {
            existingRecord = await this.create(item);
       } else {
            existingRecord = item
            existingRecord.updatedAt = getCurrentTS() // TODO: load attachments
            db.update(patientRecords).set(existingRecord).where(eq(patientRecords.id, query.id)).run();
       }
       return Promise.resolve(existingRecord as PatientRecordDTO)   
    }    

    findAll(): Promise<PatientRecordDTO[]> {
        return Promise.resolve(db.select().from(patientRecords).all() as PatientRecordDTO[])
    }

}