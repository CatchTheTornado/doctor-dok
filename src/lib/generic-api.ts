import { BaseRepository } from "@/data/server/base-repository";
import { getErrorMessage, getZedErrorMessage } from "./utils";
import { setup } from "@/data/server/db-provider";
import { ZodError, ZodObject } from "zod";

export type ApiResult = {
    message: string;
    data?: any;
    error?: any
    issues?: any[];
    status: 200 | 400 | 500;
}

export async function genericPUT<T extends { [key:string]: any }>(inputObject: any, schema: { safeParse: (a0:any) => { success: true; data: T; } | { success: false; error: ZodError; } }, repo: BaseRepository<T>, identityKey: string): Promise<ApiResult> {
    try {
        await setup();
        console.log(inputObject);
        const validationResult = schema.safeParse(inputObject); // validation
        if (validationResult.success === true) {
            const updatedValues:T = validationResult.data as T;
            const upsertedData = await repo.upsert({ [identityKey]: updatedValues[identityKey] }, updatedValues)

            return {
                message: 'Data saved successfully!',
                data: upsertedData,
                status: 200
            };
        } else {
            return {
                message: getZedErrorMessage(validationResult.error),
                issues: validationResult.error.issues,
                status: 400               
            };
        }
    } catch (e) {
        console.error(e);
        return {
            message: getErrorMessage(e),
            error: e,
            status: 500
        };
    }
}

export async function genericGET<T extends { [key:string]: any }>(request: Request, repo: BaseRepository<T>) {
    await setup()
    const items: T[] = await repo.findAll()
    return items;
}

export async function genericDELETE<T extends { [key:string]: any }>(request: Request, repo: BaseRepository<T>, query: Record<string, string | number>): Promise<ApiResult>{
    await setup()
    try {
        if(await repo.delete(query)) {
            return {
                message: 'Data deleted successfully!',
                status: 200
            }
        } else {
            return {
                message: 'Data not found!',
                status: 400
            }
        }
    } catch (e) {
        console.error(e);
        return {
            message: getErrorMessage(e),
            error: e,
            status: 500
        }
    }
}