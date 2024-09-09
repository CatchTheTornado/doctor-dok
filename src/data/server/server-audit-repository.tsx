import { BaseRepository, IFilter, IQuery } from "./base-repository"
import { and, eq } from "drizzle-orm/sql";
import { AggregatedStatsDTO, AuditDTO, StatDTO } from "../dto";
import { stats } from "./db-schema-stats";
import currentPricing from '@/data/ai/pricing.json'
import { create } from "./generic-repository";
import { audit } from "./db-schema-audit";
import { desc, asc } from 'drizzle-orm';


export default class ServerAuditRepository extends BaseRepository<AuditDTO> {
    async create(item: AuditDTO): Promise<AuditDTO> {
        const db = (await this.db());
        return create(item, audit, db); // generic implementation
    }

    async upsert(query:Record<string, any>, log: AuditDTO): Promise<AuditDTO> {        
        const db = (await this.db());
        const newLog  = await this.create(log)
        return Promise.resolve(newLog as AuditDTO)   
    }

    async findAll(query: IQuery): Promise<AuditDTO[]> {
        const db = (await this.db());
        return db.select().from(audit).offset(query.offset ?? 0).limit(query.limit ?? 100).orderBy(desc(audit.createdAt)).all() as AuditDTO[]
    }

}