import { PatientRecordDTO, patientRecordDTOSchema } from "@/db/models";
import ServerPatientRecordRepository from "@/db/server/server-patientrecord-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<PatientRecordDTO>(request, patientRecordDTOSchema, new ServerPatientRecordRepository(), 'id');
}

export async function GET(request: Request) {
    return genericGET<PatientRecordDTO>(request, new ServerPatientRecordRepository());
}
