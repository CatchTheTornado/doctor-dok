import { BaseRepository } from "@/db/server/base-repository";
import { getErrorMessage } from "./utils";
import { setup } from "@/db/server/db-provider";
import { ZodObject } from "zod";

export async function genericPUT<T extends { [key:string]: any }>(request: Request, schema: { parse: (arg0:any) => T }, repo: BaseRepository<T>, identityKey: string): Promise<Response> {
    try {
        await setup();
        const updatedValues:T = schema.parse(await request.json()) as T; // cast + validation
        const upsertedData = await repo.upsert({ [identityKey]: updatedValues[identityKey] }, updatedValues)

        return Response.json({
            message: 'Data updated',
            data: upsertedData
        });
    } catch (e) {
        console.error(e);
        return Response.json({
            message: getErrorMessage(e),
            error: e
        }, { status: 400 });
    }
}

export async function genericGET<T extends { [key:string]: any }>(request: Request, repo: BaseRepository<T>) {
    await setup()
    const patientRecords: T[] = await repo.findAll()
    return Response.json(patientRecords)
}
