import { BaseRepository, create } from "../base-repository"
import { PatientRecord, Patient } from "../models";
import { db, getCurrentTS } from '@/db/server/db-provider'
import { patientRecords } from "./schema";
import { eq } from "drizzle-orm";
import { error } from "console";

export default class ServerPatientRecordRepository extends BaseRepository<PatientRecord> {
    
    
    async create(item: PatientRecord): Promise<PatientRecord> {
        return create(item, patientRecords, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: PatientRecord): Promise<PatientRecord> {        
        let existingRecord:PatientRecord | null = query.id ? db.select().from(patientRecords).where(eq(patientRecords.id, query.id)).get() as PatientRecord : null
        if (!existingRecord) {
            existingRecord = await this.create(item);
       } else {
            existingRecord = item
            existingRecord.updatedAt = getCurrentTS() // TODO: load attachments
            db.update(patientRecords).set(existingRecord).where(eq(patientRecords.id, query.id)).run();
       }
       return Promise.resolve(existingRecord as PatientRecord)   
    }    

    findAll(): Promise<PatientRecord[]> {
        return Promise.resolve(db.select().from(patientRecords).all() as PatientRecord[])
    }

}