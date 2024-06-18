import { PatientRecordAttachmentDTO, patientRecordAttachmentDTOSchema } from "@/data/dto";
import ServerPatientRecordAttachmentRepository from "@/data/server/server-patientrecordattachment-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";
import { StorageService } from "@/lib/storage-service";
import { getErrorMessage } from "@/lib/utils";

const storageService = new StorageService();

// Rest of the code

export async function PUT(request: Request) {
    let apiResult = await genericPUT<PatientRecordAttachmentDTO>(
        await request.json(),
        patientRecordAttachmentDTOSchema,
        new ServerPatientRecordAttachmentRepository(),
        'id'
    );
    if (apiResult.status === 200) {
        try {
            const savedAttachment: PatientRecordAttachmentDTO = apiResult.data as PatientRecordAttachmentDTO;
            const formData = await request.formData();
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
    return Response.json(genericGET<PatientRecordAttachmentDTO>(request, new ServerPatientRecordAttachmentRepository()));
}
