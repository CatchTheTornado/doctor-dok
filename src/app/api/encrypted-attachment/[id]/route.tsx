import ServerEncryptedAttachmentRepository from "@/data/server/server-encryptedattachment-repository";
import { genericDELETE } from "@/lib/generic-api";
import { StorageService } from "@/lib/storage-service";
import { NextResponse } from "next/server";
const storageService = new StorageService();
export const dynamic = 'force-dynamic' // defaults to auto


export async function DELETE(request: Request, { params }: { params: { id: number }} ) {
    const recordLocator = params.id;
    if(!recordLocator){
        return Response.json({ message: "Invalid request, no id provided within request url", status: 400 }, {status: 400});
    } else { 
        return Response.json(await genericDELETE(request, new ServerEncryptedAttachmentRepository(), { id: recordLocator}));
    }
}

export async function GET(request: Request, { params }: { params: { id: string }}) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/octet-stream');
    const fileContent = await storageService.readAttachment(params.id) // TODO: add streaming
    return new Response(fileContent, { headers });
}