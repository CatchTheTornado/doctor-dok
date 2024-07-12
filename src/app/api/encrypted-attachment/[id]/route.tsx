import ServerEncryptedAttachmentRepository from "@/data/server/server-encryptedattachment-repository";
import { genericDELETE } from "@/lib/generic-api";
import { StorageService } from "@/lib/storage-service";
const storageService = new StorageService();


export async function DELETE(request: Request, { params }: { params: { id: number }} ) {
    const recordLocator = params.id;
    if(!recordLocator){
        return Response.json({ message: "Invalid request, no id provided within request url", status: 400 }, {status: 400});
    } else { 
        return Response.json(await genericDELETE(request, new ServerEncryptedAttachmentRepository(), { id: recordLocator}));
    }
}

export async function GET(request: Request, { params }: { params: { id: string }} ) {
    return new Response(storageService.readAttachment(params.id), { status: 200 });
}