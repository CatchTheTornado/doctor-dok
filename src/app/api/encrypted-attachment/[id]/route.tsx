import ServerEncryptedAttachmentRepository from "@/data/server/server-encryptedattachment-repository";
import { genericDELETE, authorizeDatabaseIdHash, genericGET } from "@/lib/generic-api";
import { StorageService } from "@/lib/storage-service";
export const dynamic = 'force-dynamic' // defaults to auto


export async function DELETE(request: Request, { params }: { params: { id: string }} ) {
    const storageService = new StorageService(await authorizeDatabaseIdHash(request));

    const recordLocator = params.id;
    if(!recordLocator){
        return Response.json({ message: "Invalid request, no id provided within request url", status: 400 }, {status: 400});
    } else { 
        const repo = new ServerEncryptedAttachmentRepository(await authorizeDatabaseIdHash(request))
        const recordBeforeDelete = await repo.findOne({ storageKey: recordLocator });
        if (!recordBeforeDelete) {
            return Response.json({ message: "Record not found", status: 404 }, {status: 404});
        }
        const apiResponse = await genericDELETE(request, repo, { storageKey: recordLocator});
        if(apiResponse.status === 200){
            storageService.deleteAttachment(recordLocator);
        }
        return Response.json(apiResponse);
    }
}

export async function GET(request: Request, { params }: { params: { id: string }}) {
    const storageService = new StorageService(await authorizeDatabaseIdHash(request));

    const headers = new Headers();
    headers.append('Content-Type', 'application/octet-stream');
    const fileContent = await storageService.readAttachment(params.id) // TODO: add streaming
    return new Response(fileContent, { headers });
}