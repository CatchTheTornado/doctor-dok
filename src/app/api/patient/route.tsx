import { PatientDTO, patientDTOSchema } from "@/db/models";
import ServerPatientRepository from "@/db/server/server-patient-repository";
import { genericGET, genericPUT } from "@/lib/generic-api";


export async function PUT(request: Request) {
    return genericPUT<PatientDTO>(request, patientDTOSchema, new ServerPatientRepository(), 'id');
}

export async function GET(request: Request) {
    return genericGET<PatientDTO>(request, new ServerPatientRepository());
}
