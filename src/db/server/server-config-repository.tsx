import { BaseRepository, create } from "../base-repository"
import { Config } from "../models";
import { db, getCurrentTS } from '@/db/server/db-provider'
import { config } from "./schema";
import { eq } from "drizzle-orm/sql";

export default class ServerConfigRepository extends BaseRepository<Config> {


    // create a new config
    async create(item: Config): Promise<Config> {
        return create(item, config, db); // generic implementation
    }

    // update config
    async upsert(query:Record<string, any>, item: Config): Promise<Config> {        
        let existingConfig = db.select({ key: config.key, value: config.value, updatedAt: config.updatedAt}).from(config).where(eq(config.key, query.key)).get() as Config
        if (!existingConfig) {
            existingConfig = await this.create(existingConfig)
        } else {
            existingConfig.value = item.value
            existingConfig.updatedAt = getCurrentTS()
            db.update(config).set(existingConfig).where(eq(config.key, query.key)).run();
        }
        return Promise.resolve(existingConfig as Config)   
    }

    async findAll(): Promise<Config[]> {
        return Promise.resolve(db.select({
            key: config.key,
            value: config.value,
            updatedAt: config.updatedAt
        }).from(config).all() as Config[])
    }

}