import { PatientRecordDTO, patientRecordDTOSchema } from "@/data/dto";
import ServerPatientRecordRepository from "@/data/server/server-patientrecord-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";

export async function PUT(request: Request) {
    return genericPUT<PatientRecordDTO>(request, patientRecordDTOSchema, new ServerPatientRecordRepository(), 'id');
}

export async function GET(request: Request) {
    return genericGET<PatientRecordDTO>(request, new ServerPatientRecordRepository());
}
