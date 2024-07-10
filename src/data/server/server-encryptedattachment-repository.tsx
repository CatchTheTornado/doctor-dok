import { BaseRepository } from "./base-repository"
import { EncryptedAttachmentDTO } from "../dto";
import { db } from '@/data/server/db-provider'
import { getCurrentTS } from "@/lib/utils";
import { encryptedAttachments } from "./db-schema";
import { eq } from "drizzle-orm";
import { create } from "./generic-repository";

export default class EncryptedAttachmentRepository extends BaseRepository<EncryptedAttachmentDTO> {
    
    
    async create(item: EncryptedAttachmentDTO): Promise<EncryptedAttachmentDTO> {
        return create(item, encryptedAttachments, db); // generic implementation
    }

    // update patient
    async upsert(query:Record<string, any>, item: EncryptedAttachmentDTO): Promise<EncryptedAttachmentDTO> {        
        let existingRecord:EncryptedAttachmentDTO | null = query.id ? db.select().from(encryptedAttachments).where(eq(encryptedAttachments.id, query.id)).get() as EncryptedAttachmentDTO : null
        if (!existingRecord) {
            existingRecord = await this.create(item);
       } else {
            existingRecord = item
            existingRecord.updatedAt = getCurrentTS() // TODO: load attachments
            db.update(encryptedAttachments).set(existingRecord).where(eq(encryptedAttachments.id, query.id)).run();
       }
       return Promise.resolve(existingRecord as EncryptedAttachmentDTO)   
    }    

    findAll(): Promise<EncryptedAttachmentDTO[]> {
        return Promise.resolve(db.select().from(encryptedAttachments).all() as EncryptedAttachmentDTO[])
    }

}