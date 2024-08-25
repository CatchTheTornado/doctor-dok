import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Pool, pool } from "./db-provider";

// import all interfaces
export type IFilter = Record<string, any> | any;

export interface IQuery {
    limit?: number;
    offset?: number;
    sort?: Record<string, any>;
    filter?: IFilter
    search?: string;
}

export interface IWrite<T> {
    create(item: T): Promise<T>;
    update(query: Record<string, any>, item: T): Promise<T>;
    delete(query: Record<string, any>): Promise<boolean>;
  }

  export interface IRead<T> {
    findAll(query: IQuery): Promise<T[]>;
    findOne(query: IFilter): Promise<T>;
  }

// that class only can be extended
export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
    databaseId: string;
    databaseSchema: string;
    constructor(databaseId: string, databaseSchema: string = '') {
        this.databaseId = databaseId;
        this.databaseSchema = databaseSchema;
    }

    async db(): Promise<BetterSQLite3Database<Record<string, never>>> {
        return (await pool)(this.databaseId, this.databaseSchema, false);
    }

    async create(item: T): Promise<T> {
        throw new Error("Method not implemented.");
    }
    async update(query: Record<string, any>, item: T): Promise<T> {
        throw new Error("Method not implemented.");
    }
    async upsert(query: Record<string, any>, item: T): Promise<T> {
        throw new Error("Method not implemented.");
    }    
    async delete(query: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async findAll(query?: IQuery): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(query: IFilter): Promise<T | null> {
        const records = await this.findAll({ filter: query });
        if(records.length > 0){
            return Promise.resolve(records[0])
        } else {
            return Promise.resolve(null)
        }
    }
}