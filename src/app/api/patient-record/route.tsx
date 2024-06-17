import { PatientRecord, patientRecordSchema } from "@/db/models";
import { setup } from '@/db/server/db-provider';
import ServerPatientRecordRepository from "@/db/server/server-patientrecord-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<PatientRecord>(request, patientRecordSchema, new ServerPatientRecordRepository(), 'id');
}

export async function GET(request: Request) {
    return genericGET<PatientRecord>(request, new ServerPatientRecordRepository());
}
