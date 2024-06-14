import { BaseRepository } from "../base-repository"
import { Config } from "../models";
import { db } from '@/db/server/db-provider'
import { config } from "./schema";
import { eq } from "drizzle-orm/sql";

export default class ServerConfigRepository extends BaseRepository<Config> {

    // create a new patinet
    update(query:Record<string, any>, item: Config): Promise<Config> {        

        if(!query.key) throw new Error('Please set the query.key to update the proper config variable');

        let existingConfig = db.select({ key: config.key, value: config.value}).from(config).where(eq(config.key, query.key)).get()
        if (!existingConfig) {
            existingConfig = db.insert(config).values(item).returning().get()
        }
        existingConfig.value = item.value
        db.update(config).set(existingConfig).where(eq(config.key, query.key)).run();
        return Promise.resolve(existingConfig as Config)   
    }

    findAll(): Promise<Config[]> {
        return Promise.resolve(db.select({
            key: config.key,
            value: config.value,
            updatedAt: config.updatedAt
        }).from(config).all() as Config[])
    }

}