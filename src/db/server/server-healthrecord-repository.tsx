import { BaseRepository } from "../base-repository"
import { HealthRecord, Patient } from "../models";
import { db, getCurrentTS } from '@/db/server/db-provider'
import { healthrecords } from "./schema";
import { eq } from "drizzle-orm";

export default class ServerHealthRecordRepository extends BaseRepository<HealthRecord> {

    // update patient
    update(query:Record<string, any>, item: HealthRecord): Promise<HealthRecord> {        

        let existingRecord:HealthRecord | null = query.id ? db.select().from(healthrecords).where(eq(healthrecords.id, query.id)).get() as HealthRecord : null
        if (!existingRecord) {
            existingRecord = db.insert(healthrecords).values(item).returning().get() as HealthRecord
            existingRecord.attachments = []
        }
        existingRecord = item
        existingRecord.updatedAt = getCurrentTS() // TODO: load attachments
        db.update(healthrecords).set(existingRecord).where(eq(healthrecords.id, query.id)).run();
        return Promise.resolve(existingRecord as HealthRecord)   
    }    

    findAll(): Promise<HealthRecord[]> {
        return Promise.resolve(db.select().from(healthrecords).all() as HealthRecord[])
    }

}