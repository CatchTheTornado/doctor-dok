import { PatientRecordAttachmentDTO, patientRecordAttachmentDTOSchema } from "@/data/models";
import { setup } from '@/data/server/db-provider';
import ServerPatientRecordAttachmentRepository from "@/data/server/server-patientrecordattachment-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<PatientRecordAttachmentDTO>(request, patientRecordAttachmentDTOSchema, new ServerPatientRecordAttachmentRepository(), 'id');
}

export async function GET(request: Request) {
    return genericGET<PatientRecordAttachmentDTO>(request, new ServerPatientRecordAttachmentRepository());
}
