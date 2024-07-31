import { BaseRepository, IQuery } from "./base-repository"
import { PatientRecordDTO } from "../dto";
import { pool } from '@/data/server/db-provider'
import { getCurrentTS } from "@/lib/utils";
import { patientRecords } from "./db-schema";
import { eq } from "drizzle-orm";
import { create } from "./generic-repository";

export default class ServerPatientRecordRepository extends BaseRepository<PatientRecordDTO> {
    
    
    async create(item: PatientRecordDTO): Promise<PatientRecordDTO> {
        const db = (await this.db());
        return create(item, patientRecords, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: PatientRecordDTO): Promise<PatientRecordDTO> { 
        const db = (await this.db());       
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

    async delete(query: Record<string, string>): Promise<boolean> {
        const db = (await this.db());
        return db.delete(patientRecords).where(eq(patientRecords.id, parseInt(query.id))).run()
    }

    async findAll(query?: IQuery): Promise<PatientRecordDTO[]> {
        const db = (await this.db());
        let dbQuery = db.select().from(patientRecords);
        if(query?.filter){
            if(query.filter['patientId']){
                dbQuery.where(eq(patientRecords.patientId, parseInt(query.filter['patientId'] as string)));
            }
        }
        return Promise.resolve(dbQuery.all() as PatientRecordDTO[])
    }
}