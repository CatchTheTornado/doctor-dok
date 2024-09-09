import { BaseRepository } from "@/data/server/base-repository";
import { getErrorMessage, getZedErrorMessage } from "./utils";
import { ZodError, ZodObject } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { authorizeKey } from "@/data/server/server-key-helpers";
import { jwtVerify } from "jose";
import { defaultKeyACL, KeyACLDTO, KeyDTO } from "@/data/dto";
import { Key } from "react";

export type ApiResult = {
    message: string;
    data?: any;
    error?: any
    issues?: any[];
    status: 200 | 400 | 500;
}

export type AuthorizedRequestContext = { 
    databaseIdHash: string;
    keyHash: string;
    keyLocatorHash: string;
    acl: KeyACLDTO;
    extra: any;
}

export async function authorizeRequestContext(request: Request, response?: NextResponse): Promise<AuthorizedRequestContext> {
    const authorizationHeader = request.headers.get('Authorization');
    const jwtToken = authorizationHeader?.replace('Bearer ', '');

    if (jwtToken) {
        const decoded = await jwtVerify(jwtToken as string, new TextEncoder().encode(process.env.NEXT_PUBLIC_TOKEN_SECRET || 'Jeipho7ahchue4ahhohsoo3jahmui6Ap'));

        const authResult = await authorizeKey({
            databaseIdHash: decoded.payload.databaseIdHash as string,
            keyHash: decoded.payload.keyHash as string,
            keyLocatorHash: decoded.payload.keyLocatorHash as string
        });
        if(!authResult) {
            NextResponse.json({ message: 'Unauthorized', status: 401 });
            throw new Error('Unauthorized. Wrong Key.');
        } else {
            const keyACL = (authResult as KeyDTO).acl ?? null;
            const aclDTO = keyACL ? JSON.parse(keyACL) : defaultKeyACL
            return {
                databaseIdHash: decoded.payload.databaseIdHash as string,
                keyHash: decoded.payload.keyHash as string,
                keyLocatorHash: decoded.payload.keyLocatorHash as string,
                acl: aclDTO as KeyACLDTO,
                extra: (authResult as KeyDTO).extra
            }
        }
    } else {
        throw new Error('Unauthorized. No Token');
    }
}

export async function genericPUT<T extends { [key:string]: any }>(inputObject: any, schema: { safeParse: (a0:any) => { success: true; data: T; } | { success: false; error: ZodError; } }, repo: BaseRepository<T>, identityKey: string): Promise<ApiResult> {
    try {
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

export async function genericGET<T extends { [key:string]: any }>(request: NextRequest, repo: BaseRepository<T>, defaultLimit: number = -1, defaultOffset: number  = -1): Promise<T[]> {
    const filterObj: Record<string, string> = Object.fromEntries(request.nextUrl.searchParams.entries());

    let limit = defaultLimit;
    let offset = defaultOffset;
    if (filterObj.limit) {
        limit = parseInt(filterObj.limit);
    }
    if (filterObj.offset) {
        offset = parseInt(filterObj.offset);
    }
    const items: T[] = await repo.findAll({ filter: filterObj, limit, offset });
    return items;
}


export async function genericDELETE<T extends { [key:string]: any }>(request: Request, repo: BaseRepository<T>, query: Record<string, string | number>): Promise<ApiResult>{
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