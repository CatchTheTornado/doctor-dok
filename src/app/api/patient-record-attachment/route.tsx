import { PatientRecordAttachmentDTO, patientRecordAttachmentDTOSchema } from "@/db/models";
import { setup } from '@/db/server/db-provider';
import ServerPatientRecordAttachmentRepository from "@/db/server/server-patientrecordattachment-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<PatientRecordAttachmentDTO>(request, patientRecordAttachmentDTOSchema, new ServerPatientRecordAttachmentRepository(), 'id');
}

export async function GET(request: Request) {
    return genericGET<PatientRecordAttachmentDTO>(request, new ServerPatientRecordAttachmentRepository());
}
