import { EncryptedAttachmentDTO, EncryptedAttachmentDTOSchema } from "@/data/dto";
import EncryptedAttachmentRepository from "@/data/server/server-encryptedattachment-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";
import { StorageService } from "@/lib/storage-service";
import { getErrorMessage } from "@/lib/utils";

const storageService = new StorageService();

// Rest of the code

export async function PUT(request: Request) {
    const formData = await request.formData();
    let apiResult = await genericPUT<EncryptedAttachmentDTO>(
        JSON.parse(formData.get("attachmentDTO") as string),
        EncryptedAttachmentDTOSchema,
        new EncryptedAttachmentRepository(),
        'id'
    );
    if (apiResult.status === 200) { // validation went OK, now we can store the file
        try {
            const savedAttachment: EncryptedAttachmentDTO = apiResult.data as EncryptedAttachmentDTO;
            const file = formData.get("file") as File;
            // TODO: move to a separate storage service
            storageService.saveAttachment(file, savedAttachment.storageKey);
        } catch (e) {
            console.error("Error saving attachment", e);
            apiResult.status = 500;
            apiResult.message = getErrorMessage(e);
            apiResult.error = e;
        }
    }
    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: Request) {
    return Response.json(await genericGET<EncryptedAttachmentDTO>(request, new EncryptedAttachmentRepository()));
}
