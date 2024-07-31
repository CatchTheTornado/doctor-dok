import ServerEncryptedAttachmentRepository from "@/data/server/server-encryptedattachment-repository";
import { genericDELETE, getDatabaseId } from "@/lib/generic-api";
import { StorageService } from "@/lib/storage-service";
import { NextResponse } from "next/server";
const storageService = new StorageService();
export const dynamic = 'force-dynamic' // defaults to auto


export async function DELETE(request: Request, { params }: { params: { id: number }} ) {
    const recordLocator = params.id;
    if(!recordLocator){
        return Response.json({ message: "Invalid request, no id provided within request url", status: 400 }, {status: 400});
    } else { 
        const apiResponse = await genericDELETE(request, new ServerEncryptedAttachmentRepository(getDatabaseId(request)), { id: recordLocator});
        if(apiResponse.status === 200){
            storageService.deleteAttachment(apiResponse.data.storageKey);
        }
        return Response.json(apiResponse);
    }
}

export async function GET(request: Request, { params }: { params: { id: string }}) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/octet-stream');
    const fileContent = await storageService.readAttachment(params.id) // TODO: add streaming
    return new Response(fileContent, { headers });
}