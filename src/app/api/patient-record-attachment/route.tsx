import { PatientRecordAttachment, patientRecordAttachmentSchema } from "@/db/models";
import { setup } from '@/db/server/db-provider';
import ServerPatientRecordAttachmentRepository from "@/db/server/server-patientrecordattachment-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<PatientRecordAttachment>(request, patientRecordAttachmentSchema, new ServerPatientRecordAttachmentRepository(), 'id');
}

export async function GET(request: Request) {
    return genericGET<PatientRecordAttachment>(request, new ServerPatientRecordAttachmentRepository());
}
