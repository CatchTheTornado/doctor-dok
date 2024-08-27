import { BaseRepository } from "./base-repository"
import { FolderDTO } from "../dto";
import { pool } from '@/data/server/db-provider'
import { folders } from "./db-schema";
import { eq } from "drizzle-orm";
import { create } from "./generic-repository";

export default class ServerFolderRepository extends BaseRepository<FolderDTO> {

    // create a new patinet
    async create(item: FolderDTO): Promise<FolderDTO> {
        const db = (await this.db());
        return create(item, folders, db); // generic implementation
    }

    // update folder
    async upsert(query:Record<string, any>, item: FolderDTO): Promise<FolderDTO> {        
        const db = (await this.db());
        let existingFolder = db.select().from(folders).where(eq(folders.id, query.id)).get() as FolderDTO
        if (!existingFolder) {
            existingFolder = await this.create(item)
        } else {
            existingFolder.name = item.name
            existingFolder.json = item.json
            db.update(folders).set(existingFolder).where(eq(folders.id, query.id)).run();
        }
        return Promise.resolve(existingFolder as FolderDTO)   
    }    

    async delete(query: Record<string, string>): Promise<boolean> {
        const db = (await this.db());
        return db.delete(folders).where(eq(folders.id, parseInt(query.id))).run()
    }

    async findAll(): Promise<FolderDTO[]> {
        const db = (await this.db());
        return Promise.resolve(db.select({
            id: folders.id,
            name: folders.name,
            updatedAt: folders.updatedAt,
            json: folders.json
        }).from(folders).all() as FolderDTO[])
    }

}