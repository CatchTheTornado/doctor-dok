import { BaseRepository } from "../base-repository"
import { Config } from "../models";
import { db, getCurrentTS } from '@/db/server/db-provider'
import { config } from "./schema";
import { eq } from "drizzle-orm/sql";

export default class ServerConfigRepository extends BaseRepository<Config> {


    // create a new config
    async create(item: Config): Promise<Config> {
        const returnedConfig = db.insert(config).values(item).returning().get()
        return Promise.resolve(returnedConfig as Config)   
    }

    // update config
    async update(query:Record<string, any>, item: Config): Promise<Config> {        

        if(!query.key) throw new Error('Please set the query.key to update the proper config variable');

        let existingConfig = db.select({ key: config.key, value: config.value, updatedAt: config.updatedAt}).from(config).where(eq(config.key, query.key)).get() as Config
        if (!existingConfig) {
            existingConfig = await this.create(existingConfig)
        }
        existingConfig.value = item.value
        existingConfig.updatedAt = getCurrentTS()
        db.update(config).set(existingConfig).where(eq(config.key, query.key)).run();
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