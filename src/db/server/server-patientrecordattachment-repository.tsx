import { BaseRepository, create } from "../base-repository"
import { PatientRecordAttachment, Patient } from "../models";
import { db, getCurrentTS } from '@/db/server/db-provider'
import { patientRecordAttachments } from "./schema";
import { eq } from "drizzle-orm";
import { error } from "console";

export default class ServerPatientRecordAttachmentRepository extends BaseRepository<PatientRecordAttachment> {
    
    
    async create(item: PatientRecordAttachment): Promise<PatientRecordAttachment> {
        return create(item, patientRecordAttachments, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: PatientRecordAttachment): Promise<PatientRecordAttachment> {        
        let existingRecord:PatientRecordAttachment | null = query.id ? db.select().from(patientRecordAttachments).where(eq(patientRecordAttachments.id, query.id)).get() as PatientRecordAttachment : null
        if (!existingRecord) {
            existingRecord = await this.create(item);
       } else {
            existingRecord = item
            existingRecord.updatedAt = getCurrentTS() // TODO: load attachments
            db.update(patientRecordAttachments).set(existingRecord).where(eq(patientRecordAttachments.id, query.id)).run();
       }
       return Promise.resolve(existingRecord as PatientRecord)   
    }    

    findAll(): Promise<PatientRecordAttachment[]> {
        return Promise.resolve(db.select().from(patientRecordAttachments).all() as PatientRecordAttachment[])
    }

}