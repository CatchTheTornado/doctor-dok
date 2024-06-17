import { BaseRepository } from "./base-repository"
import { PatientRecordAttachmentDTO, patientRecordAttachmentDTOSchema } from "../models";
import { db, getCurrentTS } from '@/db/server/db-provider'
import { patientRecordAttachments } from "./db-schema";
import { eq } from "drizzle-orm";
import { create } from "./generic-repository";

export default class ServerPatientRecordAttachmentRepository extends BaseRepository<PatientRecordAttachmentDTO> {
    
    
    async create(item: PatientRecordAttachmentDTO): Promise<PatientRecordAttachmentDTO> {
        return create(item, patientRecordAttachments, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: PatientRecordAttachmentDTO): Promise<PatientRecordAttachmentDTO> {        
        let existingRecord:PatientRecordAttachmentDTO | null = query.id ? db.select().from(patientRecordAttachments).where(eq(patientRecordAttachments.id, query.id)).get() as PatientRecordAttachmentDTO : null
        if (!existingRecord) {
            existingRecord = await this.create(item);
       } else {
            existingRecord = item
            existingRecord.updatedAt = getCurrentTS() // TODO: load attachments
            db.update(patientRecordAttachments).set(existingRecord).where(eq(patientRecordAttachments.id, query.id)).run();
       }
       return Promise.resolve(existingRecord as PatientRecordAttachmentDTO)   
    }    

    findAll(): Promise<PatientRecordAttachmentDTO[]> {
        return Promise.resolve(db.select().from(patientRecordAttachments).all() as PatientRecordAttachmentDTO[])
    }

}