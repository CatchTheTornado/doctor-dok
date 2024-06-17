import { BaseRepository } from "@/data/server/base-repository";
import { getErrorMessage, getZedErrorMessage } from "./utils";
import { setup } from "@/data/server/db-provider";
import { ZodError, ZodObject } from "zod";

export async function genericPUT<T extends { [key:string]: any }>(request: Request, schema: { safeParse: (a0:any) => { success: true; data: T; } | { success: false; error: ZodError; } }, repo: BaseRepository<T>, identityKey: string): Promise<Response> {
    try {
        await setup();
        const validationResult = schema.safeParse(await request.json()); // validation
        if (validationResult.success === true) {
            const updatedValues:T = validationResult.data as T;
            const upsertedData = await repo.upsert({ [identityKey]: updatedValues[identityKey] }, updatedValues)

            return Response.json({
                message: 'Data saved successfully!',
                data: upsertedData
            });
        } else {
            return Response.json({
                message: getZedErrorMessage(validationResult.error),
                issues: validationResult.error.issues                
            }, { status: 400 });
        }
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
