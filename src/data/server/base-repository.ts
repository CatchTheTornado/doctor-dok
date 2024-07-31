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
    async findOne(query: IFilter): Promise<T> {
        throw new Error("Method not implemented.");
    }
}