import { BaseRepository } from "./base-repository"
import { ConfigDTO } from "../dto";
import { db } from '@/data/server/db-provider'
import { getCurrentTS } from "@/lib/utils";
import { config } from "./db-schema";
import { eq } from "drizzle-orm/sql";
import { create } from "./generic-repository";

export default class ServerConfigRepository extends BaseRepository<ConfigDTO> {


    // create a new config
    async create(item: ConfigDTO): Promise<ConfigDTO> {
        return create(item, config, db); // generic implementation
    }

    // update config
    async upsert(query:Record<string, any>, item: ConfigDTO): Promise<ConfigDTO> {        
        let existingConfig = db.select({ key: config.key, value: config.value, updatedAt: config.updatedAt}).from(config).where(eq(config.key, query.key)).get() as ConfigDTO
        if (!existingConfig) {
            existingConfig = await this.create(item)
        } else {
            existingConfig.value = item.value
            existingConfig.updatedAt = getCurrentTS()
            db.update(config).set(existingConfig).where(eq(config.key, query.key)).run();
        }
        return Promise.resolve(existingConfig as ConfigDTO)   
    }

    async findAll(): Promise<ConfigDTO[]> {
        return Promise.resolve(db.select({
            key: config.key,
            value: config.value,
            updatedAt: config.updatedAt
        }).from(config).all() as ConfigDTO[])
    }

}