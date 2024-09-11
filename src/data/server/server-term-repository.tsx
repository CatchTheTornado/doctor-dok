import { BaseRepository, IFilter, IQuery } from "./base-repository"
import { KeyDTO, TermDTO } from "../dto";
import { pool } from '@/data/server/db-provider'
import { getCurrentTS } from "@/lib/utils";
import { terms } from "./db-schema";
import { eq } from "drizzle-orm/sql";
import { create } from "./generic-repository";


export default class ServerTermRepository extends BaseRepository<TermDTO> {


    // create a new config
    async create(item: TermDTO): Promise<TermDTO> {
        const db = (await this.db());
        return create(item, terms, db); // generic implementation
    }

    // update config
    async upsert(query:Record<string, any>, item: TermDTO): Promise<TermDTO> {        
        const db = (await this.db());
        let existingTerm = db.select().from(terms).where(eq(terms.key, query['key'])).get() as TermDTO
        if (!existingTerm) {
            existingTerm = await this.create(item)
        } else {
            existingTerm = item
            existingTerm.signedAt = getCurrentTS()
            db.update(terms).set(existingTerm).where(eq(terms.key, query['key'])).run();
        }
        return Promise.resolve(existingTerm as TermDTO)   
    }

    async delete(query: IFilter): Promise<boolean> {
        const db = (await this.db());
        return db.delete(terms).where(eq(terms.key, query['key'])).run().changes > 0
    }

    async findAll(query?: IQuery): Promise<TermDTO[]> {
        const db = (await this.db());
        let dbQuery = db.select().from(terms);


        return Promise.resolve(dbQuery.all() as TermDTO[])
    }

}