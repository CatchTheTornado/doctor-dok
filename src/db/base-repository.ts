// import all interfaces
export interface IWrite<T> {
    create(item: T): Promise<T>;
    update(query: Record<string, any>, item: T): Promise<T>;
    delete(query: Record<string, any>): Promise<boolean>;
  }

  export interface IRead<T> {
    findAll(): Promise<T[]>;
    findOne(query: Record<string, any>): Promise<T>;
  }

// that class only can be extended
export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
    create(item: T): Promise<T> {
        throw new Error("Method not implemented.");
    }
    update(query: Record<string, any>, item: T): Promise<T> {
        throw new Error("Method not implemented.");
    }
    delete(query: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    findOne(query: Record<string, any>): Promise<T> {
        throw new Error("Method not implemented.");
    }
}