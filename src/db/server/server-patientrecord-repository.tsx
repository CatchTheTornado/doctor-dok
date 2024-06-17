import { BaseRepository } from "../base-repository"
import { PatientRecord, Patient } from "../models";
import { db, getCurrentTS } from '@/db/server/db-provider'
import { patientRecords } from "./schema";
import { eq } from "drizzle-orm";
import { error } from "console";

export default class ServerPatientRecordRepository extends BaseRepository<PatientRecord> {

    // update patient
    update(query:Record<string, any>, item: PatientRecord): Promise<PatientRecord> {        

        let existingRecord:PatientRecord | null = query.id ? db.select().from(patientRecords).where(eq(patientRecords.id, query.id)).get() as PatientRecord : null
        if (!existingRecord) {
            throw Error('Update failed, record does not exist')
       }
        existingRecord = item
        existingRecord.updatedAt = getCurrentTS() // TODO: load attachments
        db.update(patientRecords).set(existingRecord).where(eq(patientRecords.id, query.id)).run();
        return Promise.resolve(existingRecord as PatientRecord)   
    }    

    findAll(): Promise<PatientRecord[]> {
        return Promise.resolve(db.select().from(patientRecords).all() as PatientRecord[])
    }

}