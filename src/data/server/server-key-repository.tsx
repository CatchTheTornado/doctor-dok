import { BaseRepository } from "./base-repository"
import { KeyDTO } from "../dto";
import { db } from '@/data/server/db-provider'
import { getCurrentTS } from "@/lib/utils";
import { keys } from "./db-schema";
import { eq } from "drizzle-orm/sql";
import { create } from "./generic-repository";

export default class ServerKeyRepository extends BaseRepository<KeyDTO> {


    // create a new config
    async create(item: KeyDTO): Promise<KeyDTO> {
        return create(item, keys, db); // generic implementation
    }

    // update config
    async upsert(query:Record<string, any>, item: KeyDTO): Promise<KeyDTO> {        
        let existingKey = db.select({ keyHash: keys.keyHash, databaseIdHash: keys.databaseIdHash, updatedAt: keys.updatedAt, extra: keys.extra, acl: keys.acl, expiryDate: keys.expiryDate}).from(keys).where(eq(keys.keyHash, query['keyHash'])).get() as KeyDTO
        if (!existingKey) {
            existingKey = await this.create(item)
        } else {
            existingKey = item
            existingKey.updatedAt = getCurrentTS()
            db.update(keys).set(existingKey).where(eq(keys.keyHash, query['keyHash'])).run();
        }
        return Promise.resolve(existingKey as KeyDTO)   
    }

    async delete(query: Record<string, string>): Promise<boolean> {
        return db.delete(keys).where(eq(keys.keyHash, query['keyHash'])).run()
    }

    async findAll(searchParams: Base): Promise<KeyDTO[]> {
        let query = db.select().from(keys).$dynamic

        if(searchParams){
            if(searchParams.hasOwnProperty('databaseIdHash')){
                query.where(eq(keys.databaseIdHash, searchParams['databaseIdHash']))
            }
        return Promise.resolve(query.all() as ConfigDTO[])
    }

}